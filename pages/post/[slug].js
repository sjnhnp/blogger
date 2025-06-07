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

export default function PostPage({ post }) {
    const router = useRouter();
    const [sanitizedContent, setSanitizedContent] = useState('');

    useEffect(() => {
        if (post?.content) {
            // 將淨化操作放在 useEffect 中，確保它只在客戶端執行
            const content = DOMPurify.sanitize(marked.parse(post.content), {
                ADD_TAGS: ["iframe"],
                ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height', 'title']
            });
            setSanitizedContent(content);
        }
    }, [post?.content]);

    if (router.isFallback) {
        return <div>Loading...</div>; //或者一個骨架屏
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
    const q = firestoreQuery(postsCollectionRef, where("published", "==", true));
    const snapshot = await getDocs(q);
    const paths = snapshot.docs.map(doc => ({ params: { slug: doc.data().slug || '' } })).filter(p => p.params.slug);
    return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
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
}