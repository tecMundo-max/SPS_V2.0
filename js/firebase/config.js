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
const firebaseConfig = Object.freeze({
    apiKey: "SUA_API_KEY",
    authDomain: "SPS003HJR.firebaseapp.com",
    databaseURL: "https://SPS003HJR-default-rtdb.firebaseio.com",
    projectId: "SPS003HJR",
    storageBucket: "SPS003HJR.firebasestorage.app",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
});

/**
 * Instância única da aplicação Firebase
 */
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