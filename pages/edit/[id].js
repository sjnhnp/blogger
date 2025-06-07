// ========================================================================
//                       pages/edit/[id].js
// ========================================================================
import { useUserData } from '../../lib/hooks';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { db, postsCollectionRef } from '../../lib/firebase';
import { doc, getDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import Modal from '../../components/Modal';
import { slugify, createExcerpt } from '../../lib/utils';

export default function EditPostPage() {
    const { isAdmin, loading } = useUserData();
    const router = useRouter();
    const { id } = router.query;
    
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [saving, setSaving] = useState(false);
    const [modalConfig, setModalConfig] = useState({ show: false });

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.replace('/login');
        }
    }, [isAdmin, loading, router]);
    
    useEffect(() => {
        if (id && id !== 'new') {
            const fetchPost = async () => {
                const docRef = doc(db, "posts", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title); setContent(data.content); setExcerpt(data.excerpt); setIsPublished(data.published);
                }
            };
            fetchPost();
        }
    }, [id]);

    const handleSave = async (publish) => {
        if (!title || !content) {
            setModalConfig({ show: true, title: '提醒', message: '文章標題和內容不能為空！', isConfirmDialog: false, onConfirm: () => setModalConfig({ show: false }) });
            return;
        }
        setSaving(true);
        const generatedExcerpt = excerpt || createExcerpt(content);
        const postData = { title, content, excerpt: generatedExcerpt, slug: slugify(title), updatedAt: serverTimestamp(), published: publish };
        
        try {
            if (id && id !== 'new') {
                await setDoc(doc(db, "posts", id), postData, { merge: true });
            } else {
                await addDoc(postsCollectionRef, { ...postData, createdAt: serverTimestamp() });
            }
            setModalConfig({ show: true, title: '成功', message: `文章已儲存！`, isConfirmDialog: false, onConfirm: () => router.push('/admin') });
        } catch (error) {
            setModalConfig({ show: true, title: '錯誤', message: '儲存失敗', isConfirmDialog: false, onConfirm: () => setModalConfig({ show: false }) });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !isAdmin) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Modal {...modalConfig} />
            <h1 className="text-3xl font-bold mb-8">{id !== 'new' ? '編輯文章' : '新增文章'}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ... form content is same as before ... */}
            </div>
        </div>
    );
}