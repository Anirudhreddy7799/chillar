/**
 * Shared Firebase security rules and configuration
 * This file provides centralized access to Firebase security rules for both development and deployment
 */

export const FIREBASE_RULES = {
  // Firestore rules
  firestore: {
    rules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // User rules
    match /users/{userId} {
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow write: if isAuthenticated() && isOwner(userId);
      allow create: if isAuthenticated();
    }
    
    // Subscription rules
    match /subscriptions/{subscriptionId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || isAdmin()
      );
      allow write: if isAdmin();
    }
    
    // Reward rules
    match /rewards/{rewardId} {
      allow read: if true;
      allow write: if isAuthenticated() && isAdmin();
    }
    
    // Draw rules
    match /draws/{drawId} {
      allow read: if true;
      allow write: if isAuthenticated() && isAdmin();
    }
    
    // Claim rules
    match /claims/{claimId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || isAdmin()
      );
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || isAdmin()
      );
    }
  }
}`,
  },

  // Storage rules
  storage: {
    rules: `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && (
        request.resource.size < 5 * 1024 * 1024 && // 5MB
        request.resource.contentType.matches('image/.*')
      );
    }
  }
}`,
  },
};
