// ========================================================================
//                          pages/admin.js (MODIFIED)
// ========================================================================
import { useUserData } from '../lib/hooks';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { postsCollectionRef, db } from '../lib/firebase';
import { query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Modal from '../components/Modal';
import Link from 'next/link';

export default function AdminPage() {
    const { isAdmin, loading } = useUserData();
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [modalConfig, setModalConfig] = useState({ show: false });
    const [rebuildStatus, setRebuildStatus] = useState(''); // '', 'rebuilding', 'success', 'error'

    // **FIX**: 確保頁面導航後能重新獲取最新文章列表
    const fetchPosts = useCallback(async () => {
        if (isAdmin) {
            const q = query(postsCollectionRef, orderBy("createdAt", "desc"));
            const data = await getDocs(q);
            setPosts(data.docs.map(d => ({ ...d.data(), id: d.id })));
        }
    }, [isAdmin]);

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.replace('/login');
        }
    }, [isAdmin, loading, router]);

    // **FIX**: 使用 router.isReady 確保在客戶端導航後能觸發數據獲取
    useEffect(() => {
        if (router.isReady && isAdmin) {
            fetchPosts();
        }
    }, [router.isReady, isAdmin, fetchPosts]);

    const handleDelete = (id) => {
        const performDelete = async () => {
            try {
                await deleteDoc(doc(db, "posts", id));
                setModalConfig({ show: false });
                fetchPosts(); // 重新獲取列表
            } catch (error) {
                console.error("刪除失敗", error);
                setModalConfig({ show: true, title: '錯誤', message: '刪除失敗', isConfirmDialog: false, onConfirm: () => setModalConfig({ show: false }) });
            }
        };
        setModalConfig({ show: true, title: '確認刪除', message: '確定要永久刪除這篇文章嗎？此操作無法復原。', isConfirmDialog: true, onConfirm: performDelete, onCancel: () => setModalConfig({ show: false }) });
    };

    // **FEATURE**: 觸發網站重新部署
    const handleRebuild = async () => {
        setRebuildStatus('rebuilding');
        try {
            const res = await fetch('/api/rebuild', { method: 'POST' });
            if (!res.ok) throw new Error('API request failed');
            setRebuildStatus('success');
        } catch (error) {
            console.error("Rebuild failed:", error);
            setRebuildStatus('error');
        }
        setTimeout(() => setRebuildStatus(''), 3000); // 3秒後重置狀態
    };

    if (loading || !isAdmin) return <div className="text-center py-20 font-serif">驗證身份中...</div>;

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Modal {...modalConfig} />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-4xl font-serif font-bold text-brand-dark">文章管理</h1>
                <div className="flex items-center gap-3">
                    <button onClick={handleRebuild} disabled={rebuildStatus === 'rebuilding'} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed">
                        {rebuildStatus === 'rebuilding' ? '部署中...' : rebuildStatus === 'success' ? '觸發成功!' : rebuildStatus === 'error' ? '觸發失敗' : '發布更新'}
                    </button>
                    <button onClick={() => router.push('/edit/new')} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">新增文章</button>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">標題</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最後更新</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">操作</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {posts.map((post) => (
                            <tr key={post.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {post.published ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">已發布</span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">草稿</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {post.updatedAt ? new Date(post.updatedAt.seconds * 1000).toLocaleString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <Link href={`/edit/${post.id}`} legacyBehavior><a className="text-indigo-600 hover:text-indigo-900">編輯</a></Link>
                                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900">刪除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}