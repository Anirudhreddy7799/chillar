import { createContext, useContext } from 'react';
import { User as FirebaseUser } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string | null;
  isAdmin: boolean;
  isSubscribed: boolean;
  referralCode?: string;
  referredBy?: string;
  profileCompleted?: boolean;
  uniqueId?: string;
  profile?: {
    name?: string;
    phone?: string;
    birthday?: string | Date;
    location?: string;
    avatarUrl?: string;
  };
}

export interface AuthContextType {
  currentUser: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  firebaseUser: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Rename currentUser to userDetails for better clarity in components
  return {
    ...context,
    userDetails: context.currentUser
  };
};
