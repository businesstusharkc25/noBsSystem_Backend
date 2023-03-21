// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADv_-CzLN5h3ogByjQYT4ExyKQ_bAW5EY",
  authDomain: "nobsnewsmedia.firebaseapp.com",
  projectId: "nobsnewsmedia",
  storageBucket: "nobsnewsmedia.appspot.com",
  messagingSenderId: "624952284062",
  appId: "1:624952284062:web:e2ff2cf3d328a1c4ce7c8f",
};

// Initialize Firebase
const FirebaseApp = initializeApp(firebaseConfig);
// Initialize Cloud Storage and get a reference to the service
export const firebaseStorage = getStorage(FirebaseApp);

export default FirebaseApp;
