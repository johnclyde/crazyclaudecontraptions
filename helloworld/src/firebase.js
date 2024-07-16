import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyACkFekGZJEnR9c1iYFaQLmElDuq7x_3wk",
  authDomain: "olympiads-ba812.firebaseapp.com",
  projectId: "olympiads",
  storageBucket: "olympiads.appspot.com",
  messagingSenderId: "1028322838576",
  appId: "1:1028322838576:web:137289ff0402a31a8d45f5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
