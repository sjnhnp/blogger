// ========================================================================
//                        components/Header.js (MODIFIED)
// ========================================================================
import Link from 'next/link';

export default function Header({ isAdmin, loading, onLogout }) {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" legacyBehavior>
            <a className="text-2xl font-serif font-bold text-brand-dark cursor-pointer hover:text-brand-blue transition-colors">My Elegant Blog</a>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {loading ? (
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
            ) : isAdmin ? (
              <>
                <Link href="/admin" legacyBehavior><a className="text-brand-gray hover:text-brand-blue transition-colors">管理後台</a></Link>
                <button onClick={onLogout} className="text-brand-gray hover:text-brand-blue transition-colors">登出</button>
              </>
            ) : (
                <Link href="/login" legacyBehavior><a className="text-brand-gray hover:text-brand-blue transition-colors">登入</a></Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}