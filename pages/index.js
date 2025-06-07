import { postsCollectionRef } from '../lib/firebase';
import { query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import Head from 'next/head';

const PostItem = ({ post }) => (
    <Link href={`/post/${post.slug}`} legacyBehavior>
        <a className="block bg-white rounded-lg border border-subtle overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="p-6 sm:p-8">
                <time className="block text-xs text-primary/60 mb-2 uppercase tracking-wider">{new Date(post.createdAt).toLocaleDateString()}</time>
                <h2 className="text-2xl font-serif font-bold text-primary mb-3 group-hover:text-accent transition-colors">{post.title}</h2>
                <p className="text-base text-primary/70 line-clamp-3">{post.excerpt}</p>
            </div>
        </a>
    </Link>
);

export default function HomePage({ posts }) {
  return (
    <>
        <Head>
            <title>My Elegant Blog</title>
            <meta name="description" content="一個使用 Next.js 和 Firebase 打造的優雅、快速的部落格。" />
        </Head>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts && posts.map(post => <PostItem key={post.id} post={post} />)}
            </div>
        </div>
    </>
  );
}

export async function getStaticProps() {
    try {
        const q = query(postsCollectionRef, where("published", "==", true), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0,
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : 0,
            };
        });
        return { props: { posts } };
    } catch (error) {
        console.error("getStaticProps for index failed:", error);
        return { props: { posts: [] } };
    }
}