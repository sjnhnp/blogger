// ========================================================================
//                          pages/admin.js
// ========================================================================
import { useUserData } from '../lib/hooks';
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { postsCollectionRef, db } from '../lib/firebase';
import { query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Modal from '../components/Modal';

export default function AdminPage() {
    const { isAdmin, loading } = useUserData();
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [modalConfig, setModalConfig] = useState({ show: false });

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
        };
        setModalConfig({ show: true, title: '確認刪除', message: '確定要永久刪除這篇文章嗎？', isConfirmDialog: true, onConfirm: performDelete, onCancel: () => setModalConfig({ show: false }) });
    };

    if (loading || !isAdmin) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Modal {...modalConfig} />
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">文章管理</h1>
                <button onClick={() => router.push('/edit/new')} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">新增文章</button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    {/* ... table content is same as before ... */}
                </table>
            </div>
        </div>
    );
}