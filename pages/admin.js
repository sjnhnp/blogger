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
    const [isDeploying, setIsDeploying] = useState(false);

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.replace('/login');
        }
    }, [isAdmin, loading, router]);
    
    const fetchPosts = useCallback(async () => {
        if (isAdmin) {
            const q = query(postsCollectionRef, orderBy("createdAt", "desc"));
            const data = await getDocs(q);
            setPosts(data.docs.map(d => ({ ...d.data(), id: d.id })));
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleDelete = (id) => {
        const performDelete = async () => {
            await deleteDoc(doc(db, "posts", id));
            fetchPosts();
            setModalConfig({ show: false });
        };
        setModalConfig({ show: true, title: '確認刪除', message: '確定要永久刪除這篇文章嗎？', isConfirmDialog: true, onConfirm: performDelete, onCancel: () => setModalConfig({ show: false }) });
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        const deployHookUrl = process.env.CLOUDFLARE_DEPLOY_HOOK;
        if (!deployHookUrl) {
            setModalConfig({ show: true, title: '錯誤', message: '找不到部署掛鉤 (Deploy Hook) URL。', isConfirmDialog: false, onConfirm: () => setModalConfig({ show: false }) });
            setIsDeploying(false);
            return;
        }
        try {
            const response = await fetch(deployHookUrl, { method: 'POST' });
            if (response.ok) {
                 setModalConfig({ show: true, title: '成功', message: '已成功觸發部署！網站將在幾分鐘後更新。', isConfirmDialog: false, onConfirm: () => setModalConfig({ show: false }) });
            } else {
                throw new Error('部署請求失敗');
            }
        } catch (error) {
            console.error("部署失敗:", error);
            setModalConfig({ show: true, title: '錯誤', message: '觸發部署失敗，請稍後再試或檢查您的 Deploy Hook URL。', isConfirmDialog: false, onConfirm: () => setModalConfig({ show: false }) });
        } finally {
            setIsDeploying(false);
        }
    };

    if (loading || !isAdmin) return <div className="text-center py-20">正在驗證您的身份...</div>;

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Modal {...modalConfig} />
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-primary">文章管理</h1>
                <div className="flex gap-4">
                    <Link href="/edit/new" legacyBehavior>
                        <a className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-hover transition-colors">新增文章</a>
                    </Link>
                    <button onClick={handleDeploy} disabled={isDeploying} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {isDeploying ? '部署中...' : '重新部署網站'}
                    </button>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg border border-subtle overflow-hidden">
                 <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-subtle bg-base text-left text-xs font-semibold text-primary/60 uppercase tracking-wider">標題</th>
                            <th className="px-5 py-3 border-b-2 border-subtle bg-base text-left text-xs font-semibold text-primary/60 uppercase tracking-wider">狀態</th>
                            <th className="px-5 py-3 border-b-2 border-subtle bg-base text-left text-xs font-semibold text-primary/60 uppercase tracking-wider">發布日期</th>
                            <th className="px-5 py-3 border-b-2 border-subtle bg-base"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(post => (
                        <tr key={post.id} className="hover:bg-base/50">
                            <td className="px-5 py-5 border-b border-subtle bg-transparent text-sm"><p className="text-primary whitespace-no-wrap">{post.title}</p></td>
                            <td className="px-5 py-5 border-b border-subtle bg-transparent text-sm"><span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${post.published ? 'text-green-900' : 'text-yellow-900'}`}><span aria-hidden className={`absolute inset-0 ${post.published ? 'bg-green-200' : 'bg-yellow-200'} opacity-50 rounded-full`}></span><span className="relative">{post.published ? '已發布' : '草稿'}</span></span></td>
                            <td className="px-5 py-5 border-b border-subtle bg-transparent text-sm"><p className="text-primary/80 whitespace-no-wrap">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}</p></td>
                            <td className="px-5 py-5 border-b border-subtle bg-transparent text-sm text-right">
                                <Link href={`/edit/${post.id}`} legacyBehavior><a className="text-accent hover:text-accent-hover mr-4">編輯</a></Link>
                                <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-800">刪除</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}