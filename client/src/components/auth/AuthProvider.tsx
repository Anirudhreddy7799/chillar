import { useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, getUserData } from '@/firebase';
import { CONFIG } from '@/config';
import { AuthContext, AuthUser, AuthContextType } from '@/hooks/useAuth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.error("Firebase auth is not initialized in AuthProvider");
      setLoading(false);
      return () => {};
    }

    console.log("Setting up auth state listener");
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User logged in: ${user.email}` : "User logged out");
      
      setFirebaseUser(user);
      
      if (user) {
        try {
          // Create basic user object with Firebase auth data
          const baseUserData: AuthUser = {
            uid: user.uid,
            email: user.email,
            isAdmin: CONFIG.ADMIN_EMAILS.includes(user.email || ""),
            isSubscribed: false,
            referralCode: undefined,
            referredBy: undefined,
          };
          
          // Try to get additional data from Firestore
          try {
            const userData = await getUserData(user.uid);
            console.log("Fetched user data:", userData);
            
            if (userData) {
              // Merge Firebase auth data with Firestore data
              setCurrentUser({
                ...baseUserData,
                isAdmin: userData.isAdmin || baseUserData.isAdmin,
                isSubscribed: userData.isSubscribed || false,
                referralCode: userData.referralCode,
                referredBy: userData.referredBy,
                profileCompleted: userData.profileCompleted || false,
                uniqueId: userData.uniqueId,
              });
            } else {
              // If no Firestore data, use base Firebase auth data
              console.log("No Firestore data found, using base user data");
              setCurrentUser(baseUserData);
            }
          } catch (firestoreError) {
            console.error("Error fetching user data from Firestore:", firestoreError);
            // Fall back to basic user data if Firestore fails
            setCurrentUser(baseUserData);
          }
        } catch (error) {
          console.error("Error in auth state change handling:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, firebaseUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};