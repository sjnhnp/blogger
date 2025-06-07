// ========================================================================
//                      pages/post/[slug].js (FINAL STABLE VERSION)
// ========================================================================

// **REVERT**: Removed 'export const runtime = ...'
// No runtime declaration needed for pure SSG

import { postsCollectionRef } from '../../lib/firebase';
import { query as firestoreQuery, where, getDocs, Timestamp } from 'firebase/firestore';
import { marked } from 'marked';
// **CHANGE**: We can go back to the simpler 'dompurify' since we are not in Edge anymore.
// However, 'isomorphic-dompurify' also works, so we can leave it to avoid package changes.
import DOMPurify from 'isomorphic-dompurify';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function PostPage({ post }) {
    const router = useRouter();
    const [sanitizedContent, setSanitizedContent] = useState('');

    useEffect(() => {
        if (post?.content) {
            const unsafeHtml = marked.parse(post.content);
            const safeHtml = DOMPurify.sanitize(unsafeHtml, {
                ADD_TAGS: ["iframe"],
                ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height', 'title']
            });
            setSanitizedContent(safeHtml);
        }
    }, [post?.content]);

    // router.isFallback will be true if fallback: true is used, but with false, it's not strictly necessary.
    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    if (!post) {
        return <div>文章不存在</div>;
    }
    
    return (
        <>
            <Head>
                <title>{post.title} | My Elegant Blog</title>
                <meta name="description" content={post.excerpt} />
            </Head>
            <div className="bg-white py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <article className="max-w-3xl mx-auto">
                        <header className="mb-8 text-center">
                            <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-brand-dark leading-tight mb-4">{post.title}</h1>
                            <time className="text-gray-500">
                                發布於 {new Date(post.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </time>
                        </header>
                        <div 
                            className="prose lg:prose-xl max-w-none" 
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                        />
                    </article>
                </div>
            </div>
        </>
    );
}

export async function getStaticPaths() {
    try {
        const q = firestoreQuery(postsCollectionRef, where("published", "==", true));
        const snapshot = await getDocs(q);
        const paths = snapshot.docs.map(doc => ({ params: { slug: doc.data().slug || '' } })).filter(p => p.params.slug);
        
        // **IMPORTANT CHANGE**: fallback: false means only paths generated at build time will be available.
        // This is the most stable option for Cloudflare Pages.
        return { paths, fallback: false };
    } catch (error) {
        console.error("getStaticPaths failed:", error);
        return { paths: [], fallback: false };
    }
}

export async function getStaticProps({ params }) {
    try {
        const { slug } = params;
        const q = firestoreQuery(postsCollectionRef, where("slug", "==", slug), where("published", "==", true));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return { notFound: true };
        }
        
        const docData = snapshot.docs[0].data();
        const post = {
            ...docData,
            id: snapshot.docs[0].id,
            createdAt: docData.createdAt instanceof Timestamp ? docData.createdAt.toMillis() : (docData.createdAt?.seconds * 1000 || 0),
            updatedAt: docData.updatedAt instanceof Timestamp ? docData.updatedAt.toMillis() : (docData.updatedAt?.seconds * 1000 || 0),
        };
        
        // No revalidate needed, we trigger rebuilds manually.
        return { props: { post } };
    } catch (error) {
        console.error(`getStaticProps for ${params.slug} failed:`, error);
        return { notFound: true };
    }
}