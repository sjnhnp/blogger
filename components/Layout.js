// ========================================================================
//                        components/Layout.js
// ========================================================================
import Header from './Header';
import { useUserData } from '../lib/hooks';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const { user, isAdmin, loading } = useUserData();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="min-h-screen font-sans bg-base">
      <Header user={user} isAdmin={isAdmin} loading={loading} onLogout={handleLogout} />
      <main className="py-8 sm:py-16">{children}</main>
      <footer className="text-center py-12 text-primary/50 text-sm">
        <p>© {new Date().getFullYear()} My Elegant Blog. All rights reserved.</p>
        <p className="mt-1">Powered by Next.js, Firebase & Tailwind CSS</p>
      </footer>
    </div>
  );
}