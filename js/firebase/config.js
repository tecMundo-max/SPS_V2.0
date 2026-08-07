// js/firebase/config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAeCrURSs0TBXlYF3TKLi4q98VwrGaKe_Q",
    authDomain: "spsch-849e5.firebaseapp.com",
    databaseURL: "https://spsch-849e5-default-rtdb.firebaseio.com",
    projectId: "spsch-849e5",
    storageBucket: "spsch-849e5.firebasestorage.app",
    messagingSenderId: "698967090558",
    appId: "1:698967090558:web:978781fd27b86c36203f2f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db, firebaseConfig };
export default app;
