
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfsJpZDfPiTrgWkNM7TUoF_0fQ0dw29tQ",
  authDomain: "practise-db.firebaseapp.com",
  projectId: "practise-db",
  storageBucket: "practise-db.appspot.com",
  messagingSenderId: "65949819815",
  appId: "1:65949819815:web:638ce559f60374c9e1cc82"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)


