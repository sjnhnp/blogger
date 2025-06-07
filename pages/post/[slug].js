// ========================================================================
//                      pages/post/[slug].js
// ========================================================================
import { postsCollectionRef } from '../../lib/firebase';
import { query as firestoreQuery, where, getDocs, Timestamp } from 'firebase/firestore';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { useRouter } from 'next/router';
import Head from 'next/head';

// 在伺服器端建立一個 JSDOM window 來使用 DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

export default function PostPage({ post }) {
    const router = useRouter();
    if (router.isFallback) return <div>Loading...</div>;
    const sanitizedContent = purify.sanitize(marked.parse(post.content || ''), {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height', 'title']
    });

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
    const paths = snapshot.docs.map(doc => ({ params: { slug: doc.data().slug } }));
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
        createdAt: docData.createdAt.toMillis(),
    };
    return { props: { post }, revalidate: 60 };
}