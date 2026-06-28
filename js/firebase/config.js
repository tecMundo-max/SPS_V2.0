/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/firebase/config.js
 * Versão: 3.0 (Produção)
 * Responsabilidade:
 * Inicialização única do Firebase.
 * ==========================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

/**
 * Configuração do Firebase
 * Preencha com os dados do projeto SPS003HJR.
 */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYnvcRKt4qDpk08_4MQVNEOr9Iq95X980",
  authDomain: "sps003hjr.firebaseapp.com",
  databaseURL: "https://sps003hjr-default-rtdb.firebaseio.com",
  projectId: "sps003hjr",
  storageBucket: "sps003hjr.firebasestorage.app",
  messagingSenderId: "294133615625",
  appId: "1:294133615625:web:832c4db972dcb1b92cbcd8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/**
 * Serviços da aplicação
 */
const auth = getAuth(app);
const db = getDatabase(app);

/**
 * Exportações
 */
export {
    app,
    auth,
    db,
    firebaseConfig
};

/**
 * Exportação padrão
 */
export default app;
