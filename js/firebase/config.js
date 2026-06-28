import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDYnvcRKt4qDpk08_4MQVNEOr9Iq95X980",
    authDomain: "sps003hjr.firebaseapp.com",
    databaseURL: "https://sps003hjr-default-rtdb.firebaseio.com",
    projectId: "sps003hjr",
    storageBucket: "sps003hjr.firebasestorage.app",
    messagingSenderId: "294133615625",
    appId: "1:294133615625:web:832c4db972dcb1b92cbcd8"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getDatabase(app);

export {
    app,
    auth,
    db,
    firebaseConfig
};

export default app;
