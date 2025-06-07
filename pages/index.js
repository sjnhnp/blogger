
import { postsCollectionRef } from '../lib/firebase';
import { query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import Link from 'next/link';

const PostItem = ({ post }) => (
    <Link href={`/post/${post.slug}`} legacyBehavior>
        <a className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
            <div className="p-8">
                <time className="block text-sm text-gray-500 mb-2">{new Date(post.createdAt).toLocaleDateString()}</time>
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                <p className="mt-4 text-gray-600 line-clamp-3">{post.excerpt}</p>
                <div className="mt-6 font-medium text-blue-500 group-hover:text-blue-700 transition-colors">閱讀更多 &rarr;</div>
            </div>
        </a>
    </Link>
);

export default function HomePage({ posts }) {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
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
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0,
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : 0,
            };
        });
        // **修正**: 移除 revalidate，改為純靜態生成
        return { props: { posts } };
    } catch (error) {
        console.error("getStaticProps for index failed:", error);
        return { props: { posts: [] } };
    }
}