import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBeKKQjIx0RGA5Gxo6tj2nJxmE3bufvDOc",
  authDomain: "chillarclub351.firebaseapp.com",
  projectId: "chillarclub351",
  storageBucket: "chillarclub351.appspot.com",
  messagingSenderId: "62243064163",
  appId: "1:62243064163:web:87c23dd60fbced4b6f2b56",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
