// ========================================================================
//                           lib/hooks.js
// ========================================================================
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useUserData() {
  const [user, loadingAuth] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
        if (user) {
            setLoadingAdmin(true);
            const adminRef = doc(db, "admins", user.uid);
            const adminSnap = await getDoc(adminRef);
            setIsAdmin(adminSnap.exists());
            setLoadingAdmin(false);
        } else {
            setIsAdmin(false);
            setLoadingAdmin(false);
        }
    }
    
    if (!loadingAuth) {
        checkAdmin();
    }
  }, [user, loadingAuth]);

  return { user, isAdmin, loading: loadingAuth || loadingAdmin };
}