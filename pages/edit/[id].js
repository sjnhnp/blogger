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
import Link from 'next/link';

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
            setModalConfig({ show: true, title: '成功', message: `文章已儲存！請點擊管理後台的「重新部署網站」按鈕來發布更新。`, isConfirmDialog: false, onConfirm: () => router.push('/admin') });
        } catch (error) {
            console.error("儲存失敗", error);
            setModalConfig({ show: true, title: '錯誤', message: '儲存失敗', isConfirmDialog: false, onConfirm: () => setModalConfig({ show: false }) });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !isAdmin) return <div className="text-center py-20">正在驗證您的身份...</div>;

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Modal {...modalConfig} />
            <h1 className="text-3xl font-serif font-bold mb-8">{id && id !== 'new' ? '編輯文章' : '新增文章'}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <input type="text" placeholder="文章標題" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-3xl font-serif font-bold p-3 border-2 border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-transparent" />
                    <textarea placeholder="在這裡輸入 Markdown 內容..." value={content} onChange={(e) => setContent(e.target.value)} className="w-full h-96 p-3 border-2 border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-accent font-mono bg-transparent" />
                    <textarea placeholder="文章摘要 (選填)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full h-24 p-3 border-2 border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-transparent" />
                </div>
                <div className="space-y-6">
                    <div className="bg-white/50 border border-subtle p-6 rounded-lg">
                        <h3 className="text-lg font-serif font-semibold mb-4">發布設定</h3>
                        <div className="flex items-center">
                            <input type="checkbox" id="isPublished" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent" />
                            <label htmlFor="isPublished" className="ml-2 block text-sm text-primary">設為公開發布</label>
                        </div>
                    </div>
                    <div className="bg-white/50 border border-subtle p-6 rounded-lg">
                        <h3 className="text-lg font-serif font-semibold mb-4">操作</h3>
                        <button onClick={() => handleSave(isPublished)} disabled={saving} className="w-full bg-accent text-white py-2 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50">{saving ? '儲存中...' : (isPublished ? '發布文章' : '儲存草稿')}</button>
                        <Link href="/admin" legacyBehavior>
                           <a className="block w-full mt-3 text-center text-primary/80 py-2 rounded-md hover:bg-gray-200/50 transition-colors">取消</a>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}