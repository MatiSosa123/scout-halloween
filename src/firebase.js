import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBAb-FX2KAv-OoKwdcyr8TT2gZKOQfJg3w",
  authDomain: "scout-fiesta-primavera.firebaseapp.com",
  projectId: "scout-fiesta-primavera",
  storageBucket: "scout-fiesta-primavera.firebasestorage.app",
  messagingSenderId: "698746294766",
  appId: "1:698746294766:web:c03ed2d8fbabd418483eff"
};

const app = initializeApp(firebaseConfig);

// Inicializamos Firestore con persistencia offline (guarda datos en el celu)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

export const auth = getAuth(app);