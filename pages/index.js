// ========================================================================
//                         pages/index.js (MODIFIED)
// ========================================================================
import { postsCollectionRef } from '../lib/firebase';
import { query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import Link from 'next/link';

const PostItem = ({ post }) => (
    <Link href={`/post/${post.slug}`} legacyBehavior>
        <a className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <div className="p-6 sm:p-8">
                <time className="block text-sm text-gray-500 mb-2 font-medium tracking-wide uppercase">{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                <h2 className="text-2xl font-serif font-bold text-brand-dark group-hover:text-brand-blue transition-colors duration-300">{post.title}</h2>
                <p className="mt-3 text-brand-gray line-clamp-3 leading-relaxed">{post.excerpt}</p>
                <div className="mt-6 font-semibold text-brand-blue group-hover:text-blue-700 transition-colors duration-300 flex items-center">
                    閱讀更多 <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
            </div>
        </a>
    </Link>
);

export default function HomePage({ posts }) {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-serif font-bold text-brand-dark">Blog</h1>
        <p className="mt-3 text-lg text-brand-gray max-w-2xl mx-auto">探索、學習、分享我的想法與發現。</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts && posts.map(post => <PostItem key={post.id} post={post} />)}
      </div>
    </div>
  );
}

export async function getStaticProps() {
    try {
        const q = query(postsCollectionRef, where("published", "==", true), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                // 確保時間戳是可序列化的 milliseconds
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : (data.createdAt?.seconds * 1000 || 0),
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : (data.updatedAt?.seconds * 1000 || 0),
            };
        });
        return { props: { posts } };
    } catch (error) {
        console.error("getStaticProps for index failed:", error);
        return { props: { posts: [] } };
    }
}