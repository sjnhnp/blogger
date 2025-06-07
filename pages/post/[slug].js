// ========================================================================
//                      pages/post/[slug].js (MODIFIED)
// ========================================================================
import { postsCollectionRef } from '../../lib/firebase';
import { query as firestoreQuery, where, getDocs, Timestamp } from 'firebase/firestore';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';

// **修正**: 移除 runtime = 'experimental-edge'
// export const runtime = 'experimental-edge';

export default function PostPage({ post }) {
    const router = useRouter();
    const [sanitizedContent, setSanitizedContent] = useState('');

    useEffect(() => {
        if (post?.content) {
            const content = DOMPurify.sanitize(marked.parse(post.content), {
                ADD_TAGS: ["iframe"],
                ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height', 'title']
            });
            setSanitizedContent(content);
        }
    }, [post?.content]);

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
            <main className="bg-white py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <article className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">{post.title}</h1>
                        <time className="text-gray-500 mb-8 block">發布於 {new Date(post.createdAt).toLocaleDateString()}</time>
                        <div className="prose lg:prose-xl max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedContent }}/>
                    </article>
                </div>
            </main>
        </>
    );
}

export async function getStaticPaths() {
    try {
        const q = firestoreQuery(postsCollectionRef, where("published", "==", true));
        const snapshot = await getDocs(q);
        const paths = snapshot.docs.map(doc => ({ params: { slug: doc.data().slug || '' } })).filter(p => p.params.slug);
        return { paths, fallback: 'blocking' };
    } catch (error) {
        console.error("getStaticPaths failed:", error);
        return { paths: [], fallback: 'blocking' }; // 返回空 paths 以防建置失敗
    }
}

export async function getStaticProps({ params }) {
    try {
        const { slug } = params;
        const q = firestoreQuery(postsCollectionRef, where("slug", "==", slug), where("published", "==", true));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return { notFound: true };
        const docData = snapshot.docs[0].data();
        const post = {
            ...docData,
            id: snapshot.docs[0].id,
            createdAt: docData.createdAt instanceof Timestamp ? docData.createdAt.toMillis() : 0,
            updatedAt: docData.updatedAt instanceof Timestamp ? docData.updatedAt.toMillis() : 0,
        };
        return { props: { post }, revalidate: 60 };
    } catch (error) {
        console.error(`getStaticProps for ${params.slug} failed:`, error);
        return { notFound: true };
    }
}