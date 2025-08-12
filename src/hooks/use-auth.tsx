
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
import { usePathname, useRouter } from "@/navigation";

interface AuthContextType {
  user: User | null;
  userData: DocumentData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

const createUserDocument = async (user: User) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        try {
            await setDoc(userRef, {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                plan: "Free Trial",
                joined: serverTimestamp(),
                isAdmin: false, // All new users default to non-admin.
            });
        } catch (error) {
            console.error("Error creating user document in Firestore:", error);
        }
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (authUser) {
        setLoading(true);
        // Ensure user document exists or is created on login/signup.
        await createUserDocument(authUser); 
        
        // Listen for changes in the user's document.
        const userDocRef = doc(db, 'users', authUser.uid);
        unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
          setUser(authUser);
          setUserData(doc.exists() ? doc.data() : null);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user data:", error);
          setUser(authUser);
          setUserData(null);
          setLoading(false);
        });

      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function ProtectRoute({ children }: { children: ReactNode }) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isAuthPage = pathname.includes('/login') || pathname.includes('/signup') || pathname.includes('/iniciar-sesion') || pathname.includes('/registro') || pathname.includes('/cadastro');
    const isAdminPage = pathname.startsWith('/admin');
    const isPublicPage = isAuthPage || pathname === '/';
    
    useEffect(() => {
        if (loading) {
            return;
        }

        // Check the 'isAdmin' field from the Firestore document instead of the token claim.
        const isUserAdmin = userData?.isAdmin === true;

        if (!user && !isPublicPage) {
            router.push('/login');
            return;
        }

        if (user && isAuthPage) {
           router.push('/dashboard');
           return;
        }
        
        if (isAdminPage && !isUserAdmin) {
            router.push('/dashboard');
            return;
        }

    }, [user, userData, loading, router, pathname, isAdminPage, isAuthPage, isPublicPage]);

    if (loading || (!user && !isPublicPage) || (user && isAuthPage) || (isAdminPage && !(userData?.isAdmin === true))) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <p>Loading...</p>
            </div>
        );
    }
    
    return <>{children}</>;
}
