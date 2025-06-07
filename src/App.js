import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, setDoc, deleteDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// --- Firebase 配置區 ---
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
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/--+/g, '-');
};

// **新增**: 產生乾淨文章摘要的函式
const generateCleanExcerpt = (markdownContent, maxLength = 150) => {
    if (!markdownContent) return '';

    // 1. 使用 'marked' 將 Markdown 轉換為 HTML
    const html = marked.parse(markdownContent);

    // 2. 利用瀏覽器 DOM 功能來移除所有 HTML 標籤
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    let text = tempDiv.textContent || tempDiv.innerText || '';

    // 3. 清理多餘的空白和換行符，使其更像一段摘要
    text = text.replace(/\s+/g, ' ').trim();

    // 4. 截取指定長度並在需要時加上省略號
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }

    return text;
};


// --- 組件 ---

const Modal = ({ show, title, message, onConfirm, onCancel, isConfirmDialog }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className={`flex ${isConfirmDialog ? 'justify-between' : 'justify-end'}`}>
                    {isConfirmDialog && <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">取消</button>}
                    <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{isConfirmDialog ? '確定' : '好的'}</button>
                </div>
            </div>
        </div>
    );
};

const SkeletonPostItem = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="p-8">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div className="h-6 bg-blue-200 rounded w-1/3 mt-6"></div>
      </div>
    </div>
);

const PostPageSkeleton = () => (
    <main className="bg-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <article className="max-w-3xl mx-auto animate-pulse">
                <div className="h-12 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-6 bg-gray-200 rounded w-full mt-6"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
            </article>
        </div>
    </main>
);


const Header = ({ admin, onLogout, navigate }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors">
            My Elegant Blog
          </a>
          <nav>
            {admin ? (
              <>
                <a href="/admin" onClick={(e) => { e.preventDefault(); navigate('/admin'); }} className="mr-4 text-gray-600 hover:text-blue-600 font-medium transition-colors">管理後台</a>
                <button onClick={onLogout} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">登出</button>
              </>
            ) : (
              <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">登入</a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

const PostItem = ({ post, navigate }) => (
  <article 
    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
    onClick={() => navigate(`/post/${post.slug}`)}
  >
    <div className="p-8">
      <time className="block text-sm text-gray-500 mb-2">{post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : '日期未知'}</time>
      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{post.title}</h2>
      <p className="mt-4 text-gray-600">{post.excerpt}</p>
      <div className="mt-6 font-medium text-blue-500 group-hover:text-blue-700 transition-colors">閱讀更多 →</div>
    </div>
  </article>
);


const HomePage = ({ navigate }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const q = query(postsCollectionRef, where("published", "==", true), orderBy("createdAt", "desc"));
        const data = await getDocs(q);
        setPosts(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error("讀取文章失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
        <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => <SkeletonPostItem key={i} />)}
            </div>
        </main>
    );
  }

  return (
    <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => <PostItem key={post.id} post={post} navigate={navigate} />)}
      </div>
    </main>
  );
};

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
                    const sanitizedContent = DOMPurify.sanitize(marked.parse(docData.content || ''), {
                        ADD_TAGS: ["iframe"],
                        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height', 'title']
                    });
                    setPost({ ...docData, sanitizedContent });
                } else {
                    console.error("找不到文章");
                    setPost(null);
                }
            } catch (error) {
                console.error("讀取文章內容失敗:", error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchPost();
    }, [slug]);

    if (loading) return <PostPageSkeleton />;
    
    if (!post) return <div className="text-center py-20">找不到這篇文章。</div>;

    return (
        <main className="bg-white py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <article className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">{post.title}</h1>
                    <time className="text-gray-500 mb-8 block">{post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : '日期未知'}</time>
                    <div className="prose lg:prose-xl max-w-none" dangerouslySetInnerHTML={{ __html: post.sanitizedContent }}/>
                </article>
            </div>
        </main>
    );
};

const AdminLogin = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
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
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">密碼</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300">
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ navigate, setModalConfig }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(postsCollectionRef, orderBy("createdAt", "desc"));
      setPosts((await getDocs(q)).docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("讀取所有文章失敗:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = (id) => {
    const performDelete = async () => {
        try {
            await deleteDoc(doc(db, "posts", id));
            fetchPosts();
        } catch (error) {
            console.error("刪除失敗:", error);
            setModalConfig({ show: true, title: '錯誤', message: '刪除失敗，請稍後再試。', isConfirmDialog: false });
        }
    };
    setModalConfig({ show: true, title: '確認刪除', message: '確定要永久刪除這篇文章嗎？此操作無法復原。', isConfirmDialog: true, onConfirm: performDelete });
  };

  if (loading) return <div className="text-center py-20">讀取中...</div>;

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">文章管理</h1>
        <button onClick={() => navigate('/edit/new')} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">新增文章</button>
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
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{post.title}</p></td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${post.published ? 'text-green-900' : 'text-yellow-900'}`}><span aria-hidden className={`absolute inset-0 ${post.published ? 'bg-green-200' : 'bg-yellow-200'} opacity-50 rounded-full`}></span><span className="relative">{post.published ? '已發布' : '草稿'}</span></span></td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p></td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                        <button onClick={() => navigate(`/edit/${post.id}`)} className="text-indigo-600 hover:text-indigo-900 mr-4">編輯</button>
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

const EditorPage = ({ id, navigate, setModalConfig }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, "posts", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title); setContent(data.content); setExcerpt(data.excerpt); setIsPublished(data.published);
          }
        } catch (error) { console.error("讀取文章失敗:", error); } 
        finally { setLoading(false); }
      };
      fetchPost();
    } else { setLoading(false); }
  }, [id]);

  const handleSave = async (publish) => {
    if (!title || !content) {
      setModalConfig({ show: true, title: '提醒', message: '文章標題和內容不能為空！', isConfirmDialog: false });
      return;
    }
    setSaving(true);
    // **修改**: 使用新的 generateCleanExcerpt 函式
    const postData = { title, content, excerpt: excerpt || generateCleanExcerpt(content), slug: slugify(title), updatedAt: serverTimestamp(), published: publish };
    try {
      if (id && id !== 'new') {
        await setDoc(doc(db, "posts", id), postData, { merge: true });
      } else {
        await addDoc(postsCollectionRef, { ...postData, createdAt: serverTimestamp() });
      }
      setModalConfig({ show: true, title: '成功', message: `文章已${publish ? '成功發布' : '儲存為草稿'}！`, isConfirmDialog: false, onConfirm: () => navigate('/admin') });
    } catch (error) {
      console.error("儲存失敗:", error);
      setModalConfig({ show: true, title: '錯誤', message: '儲存失敗，請檢查網路連線或稍後再試。', isConfirmDialog: false });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) return <div className="text-center py-20">讀取中...</div>;

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">{id && id !== 'new' ? '編輯文章' : '新增文章'}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <input type="text" placeholder="文章標題" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-2xl font-bold p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="在這裡輸入 Markdown 內容...
舉例來說，您可以直接貼上從 YouTube 分享功能複製的 <iframe> 程式碼。" value={content} onChange={(e) => setContent(e.target.value)} className="w-full h-96 p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            <textarea placeholder="文章摘要 (選填，若留空會自動擷取內文前150字)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full h-24 p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">發布設定</h3>
                <div className="flex items-center">
                    <input type="checkbox" id="isPublished" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">設為公開發布</label>
                </div>
                <p className="text-xs text-gray-500 mt-2">勾選後，所有訪客都能看到這篇文章。若不勾選，則會儲存為草稿。</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">操作</h3>
                <button onClick={() => handleSave(isPublished)} disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300">{saving ? '儲存中...' : (isPublished ? '發布文章' : '儲存草稿')}</button>
                <button onClick={() => navigate('/admin')} className="w-full mt-3 text-center text-gray-600 py-2 rounded-md hover:bg-gray-100 transition-colors">取消</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [location, setLocation] = useState(window.location.pathname);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [modalConfig, setModalConfig] = useState({ show: false, title: '', message: '', onConfirm: () => {}, onCancel: () => {}, isConfirmDialog: false });

  useEffect(() => {
    const handlePopState = () => setLocation(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminSnap = await getDoc(doc(db, "admins", user.uid));
        setIsAdmin(adminSnap.exists());
      } else {
        setIsAdmin(false);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setLocation(path);
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const closeModal = () => setModalConfig(prev => ({ ...prev, show: false }));
  const handleModalConfirm = () => { if (modalConfig.onConfirm) { modalConfig.onConfirm(); } closeModal(); };
  const handleModalCancel = () => { if (modalConfig.onCancel) { modalConfig.onCancel(); } closeModal(); };

  const renderContent = () => {
    const path = location.split('/');
    
    if (!authReady) {
        if (path[1] === 'post' && path[2]) {
            return <PostPageSkeleton />;
        }
        return (
            <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => <SkeletonPostItem key={i} />)}
                </div>
            </main>
        );
    }
    
    if ((path[1] === 'admin' || path[1] === 'edit') && !isAdmin) {
        return <AdminLogin navigate={navigate} />;
    }

    if (path[1] === 'post' && path[2]) {
        return <PostPage slug={path[2]} />;
    }
    if (path[1] === 'admin') {
        return <AdminDashboard navigate={navigate} setModalConfig={setModalConfig} />;
    }
    if (path[1] === 'edit' && path[2]) {
        return <EditorPage id={path[2]} navigate={navigate} setModalConfig={setModalConfig} />;
    }
    if (path[1] === 'login') {
        return <AdminLogin navigate={navigate} />;
    }
    
    return <HomePage navigate={navigate} />;
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header admin={isAdmin} onLogout={handleLogout} navigate={navigate} />
      <Modal show={modalConfig.show} title={modalConfig.title} message={modalConfig.message} onConfirm={handleModalConfirm} onCancel={handleModalCancel} isConfirmDialog={modalConfig.isConfirmDialog} />
      {renderContent()}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} My Elegant Blog. All rights reserved.</p>
        <p className="mt-1">Powered by React, Firebase & Tailwind CSS</p>
      </footer>
    </div>
  );
}
