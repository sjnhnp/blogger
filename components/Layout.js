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
    <div className="min-h-screen font-sans">
      <Header user={user} isAdmin={isAdmin} loading={loading} onLogout={handleLogout} />
      <main>{children}</main>
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} My Elegant Blog. All rights reserved.</p>
        <p className="mt-1">Powered by Next.js, Firebase & Tailwind CSS</p>
      </footer>
    </div>
  );
}