import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, setDoc, deleteDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// --- Firebase 配置區 ---
// 提示：請將下方的 Firebase 配置換成您自己的專案配置。
const firebaseConfig = {
    apiKey: "AIzaSyBYobOYTW2tiV8KyC5Dgz6_wV0tIEI59ec",
    authDomain: "iblogger-8eb88.firebaseapp.com",
    projectId: "iblogger-8eb88",
    storageBucket: "iblogger-8eb88.firebasestorage.app",
    messagingSenderId: "720590074748",
    appId: "1:720590074748:web:1726cfb2e502bf2073eaf9"
};


// --- Firebase 初始化 ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const postsCollectionRef = collection(db, "posts");

// --- 輔助函式 ---
const slugify = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

// --- 組件 ---

// ... (Header, PostItem, HomePage, PostPage 等組件的程式碼與之前相同，此處省略以保持簡潔)
// ... (若需要，我可以再次提供完整的組件程式碼)

// 頁首導覽列
const Header = ({ admin, onLogout, setRoute }) => {
    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div
                        className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => setRoute({ name: 'home' })}
                    >
                        My Elegant Blog
                    </div>
                    <nav>
                        {admin ? (
                            <>
                                <button
                                    onClick={() => setRoute({ name: 'admin' })}
                                    className="mr-4 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                                >
                                    管理後台
                                </button>
                                <button
                                    onClick={onLogout}
                                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                                >
                                    登出
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setRoute({ name: 'login' })}
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            >
                                登入
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

// 文章列表項
const PostItem = ({ post, onPostClick }) => (
    <article
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
        onClick={() => onPostClick(post.slug)}
    >
        <div className="p-8">
            <time className="block text-sm text-gray-500 mb-2">
                {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : '日期未知'}
            </time>
            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {post.title}
            </h2>
            <p className="mt-4 text-gray-600">
                {post.excerpt}
            </p>
            <div className="mt-6 font-medium text-blue-500 group-hover:text-blue-700 transition-colors">
                閱讀更多 &rarr;
            </div>
        </div>
    </article>
);


// 首頁
const HomePage = ({ setRoute }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const q = query(postsCollectionRef, where("published", "==", true), orderBy("createdAt", "desc"));
                const data = await getDocs(q);
                const fetchedPosts = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("讀取文章失敗:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) {
        return <div className="text-center py-20">讀取中...</div>;
    }

    return (
        <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map(post => (
                    <PostItem key={post.id} post={post} onPostClick={(slug) => setRoute({ name: 'post', slug })} />
                ))}
            </div>
        </main>
    );
};

// 文章內頁
const PostPage = ({ slug }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const q = query(postsCollectionRef, where("slug", "==", slug), where("published", "==", true));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0].data();
                    const sanitizedContent = DOMPurify.sanitize(marked(docData.content || ''));
                    setPost({ ...docData, sanitizedContent });
                } else {
                    console.error("找不到文章");
                }
            } catch (error) {
                console.error("讀取文章內容失敗:", error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchPost();
    }, [slug]);

    if (loading) return <div className="text-center py-20">讀取中...</div>;
    if (!post) return <div className="text-center py-20">找不到這篇文章。</div>;

    return (
        <main className="bg-white py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <article className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">{post.title}</h1>
                    <time className="text-gray-500 mb-8 block">
                        發布於 {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : '日期未知'}
                    </time>
                    <div
                        className="prose lg:prose-xl max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.sanitizedContent }}
                    />
                </article>
            </div>
        </main>
    );
};

// 管理員登入頁
const AdminLogin = ({ onLoginSuccess, setRoute }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // **改變之處**: 不再檢查Email，直接嘗試登入
            await signInWithEmailAndPassword(auth, email, password);
            // onLoginSuccess 回調會由 onAuthStateChanged 觸發，這裡不需要手動調用
            // 登入成功後，onAuthStateChanged 會自動檢測到並更新 isAdmin 狀態
            setRoute({ name: 'admin' });
        } catch (err) {
            setError('登入失敗，請檢查 Email 和密碼。');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">管理員登入</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700">密碼</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    >
                        {loading ? '登入中...' : '登入'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// 管理後台
const AdminDashboard = ({ setRoute }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(postsCollectionRef, orderBy("createdAt", "desc"));
            const data = await getDocs(q);
            setPosts(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        } catch (error) {
            console.error("讀取所有文章失敗:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleDelete = async (id) => {
        // 為了更好的使用者體驗，使用自訂的 modal 而不是 window.confirm
        if (window.confirm("確定要刪除這篇文章嗎？")) {
            try {
                await deleteDoc(doc(db, "posts", id));
                fetchPosts(); // 重新整理列表
            } catch (error) {
                console.error("刪除失敗:", error);
                alert("刪除失敗！");
            }
        }
    };

    if (loading) return <div className="text-center py-20">讀取中...</div>;

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">文章管理</h1>
                <button
                    onClick={() => setRoute({ name: 'edit', id: null })}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                    新增文章
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">標題</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">狀態</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">發布日期</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(post => (
                            <tr key={post.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{post.title}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${post.published ? 'text-green-900' : 'text-yellow-900'}`}>
                                        <span aria-hidden className={`absolute inset-0 ${post.published ? 'bg-green-200' : 'bg-yellow-200'} opacity-50 rounded-full`}></span>
                                        <span className="relative">{post.published ? '已發布' : '草稿'}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                                    <button onClick={() => setRoute({ name: 'edit', id: post.id })} className="text-indigo-600 hover:text-indigo-900 mr-4">編輯</button>
                                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900">刪除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 文章編輯器
const EditorPage = ({ id, setRoute }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchPost = async () => {
                setLoading(true);
                try {
                    const docRef = doc(db, "posts", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setTitle(data.title);
                        setContent(data.content);
                        setExcerpt(data.excerpt);
                        setIsPublished(data.published);
                    }
                } catch (error) {
                    console.error("讀取文章失敗:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPost();
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleSave = async (publish) => {
        if (!title || !content) {
            alert("標題和內容不能為空！");
            return;
        }
        setSaving(true);

        const postData = {
            title,
            content,
            excerpt: excerpt || content.substring(0, 150),
            slug: slugify(title),
            updatedAt: serverTimestamp(),
            published: publish,
        };

        try {
            if (id) {
                const docRef = doc(db, "posts", id);
                await setDoc(docRef, postData, { merge: true });
            } else {
                await addDoc(postsCollectionRef, {
                    ...postData,
                    createdAt: serverTimestamp(),
                });
            }
            alert(`文章已${publish ? '發布' : '儲存為草稿'}！`);
            setRoute({ name: 'admin' });
        } catch (error) {
            console.error("儲存失敗:", error);
            alert("儲存失敗！");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-20">讀取中...</div>;

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8">{id ? '編輯文章' : '新增文章'}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <input
                        type="text"
                        placeholder="文章標題"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-2xl font-bold p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        placeholder="在這裡輸入 Markdown 內容..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-96 p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <textarea
                        placeholder="文章摘要 (選填，若留空會自動擷取內文前150字)"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        className="w-full h-24 p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">發布設定</h3>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isPublished"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                                設為公開發布
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            勾選後，所有訪客都能看到這篇文章。若不勾選，則會儲存為草稿。
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">操作</h3>
                        <button
                            onClick={() => handleSave(isPublished)}
                            disabled={saving}
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                        >
                            {saving ? '儲存中...' : (isPublished ? '發布文章' : '儲存草稿')}
                        </button>
                        <button
                            onClick={() => setRoute({ name: 'admin' })}
                            className="w-full mt-3 text-center text-gray-600 py-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            取消
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// 主應用程式
export default function App() {
    const [route, setRoute] = useState({ name: 'home' });
    const [isAdmin, setIsAdmin] = useState(false);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        // **改變之處**: 核心的權限驗證邏輯
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // 使用者已登入，檢查他們是否有管理員權限
                const adminRef = doc(db, "admins", user.uid);
                const adminSnap = await getDoc(adminRef);
                if (adminSnap.exists()) {
                    // 這個使用者的 UID 存在於 'admins' 集合中
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } else {
                // 使用者未登入
                setIsAdmin(false);
            }
            // 驗證流程完成，可以顯示頁面內容
            setAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setRoute({ name: 'home' });
    };

    const renderContent = () => {
        if (!authReady) {
            return <div className="text-center py-20">驗證身份中...</div>;
        }

        const targetRoute = route.name;

        if (targetRoute === 'admin' && !isAdmin) {
            return <AdminLogin setRoute={setRoute} />;
        }
        if (targetRoute === 'edit' && !isAdmin) {
            return <AdminLogin setRoute={setRoute} />;
        }

        switch (targetRoute) {
            case 'admin':
                return <AdminDashboard setRoute={setRoute} />;
            case 'edit':
                return <EditorPage id={route.id} setRoute={setRoute} />;
            case 'login':
                return <AdminLogin setRoute={setRoute} />;
            case 'post':
                return <PostPage slug={route.slug} />;
            case 'home':
            default:
                return <HomePage setRoute={setRoute} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Header admin={isAdmin} onLogout={handleLogout} setRoute={setRoute} />
            {renderContent()}
            <footer className="text-center py-8 text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} My Elegant Blog. All rights reserved.</p>
                <p className="mt-1">Powered by React, Firebase & Tailwind CSS</p>
            </footer>
        </div>
    );
}

