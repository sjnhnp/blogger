
// ========================================================================
//                        components/Header.js
// ========================================================================
import Link from 'next/link';

export default function Header({ isAdmin, loading, onLogout }) {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" legacyBehavior>
            <a className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors">My Elegant Blog</a>
          </Link>
          <nav>
            {loading ? (
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            ) : isAdmin ? (
              <>
                <Link href="/admin" legacyBehavior><a className="mr-4 text-gray-600 hover:text-blue-600 font-medium transition-colors">管理後台</a></Link>
                <button onClick={onLogout} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">登出</button>
              </>
            ) : (
                <Link href="/login" legacyBehavior><a className="text-gray-600 hover:text-blue-600 font-medium transition-colors">登入</a></Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
