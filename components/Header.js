// ========================================================================
//                        components/Header.js
// ========================================================================
import Link from 'next/link';

export default function Header({ isAdmin, loading, onLogout }) {
  return (
    <header className="sticky top-0 z-40 bg-base/70 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 border-b border-subtle">
          <Link href="/" legacyBehavior>
            <a className="text-2xl font-serif font-bold text-primary cursor-pointer hover:text-accent transition-colors">
              My Elegant Blog
            </a>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium text-primary/80">
            {loading ? (
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            ) : isAdmin ? (
              <>
                <Link href="/admin" legacyBehavior><a className="hover:text-accent transition-colors">管理後台</a></Link>
                <button onClick={onLogout} className="hover:text-accent transition-colors">登出</button>
              </>
            ) : (
                <Link href="/login" legacyBehavior><a className="hover:text-accent transition-colors">登入</a></Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}