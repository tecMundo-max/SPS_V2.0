/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/firebase/auth.js
 * Versao: 4.0
 * Responsabilidade:
 * Adaptador fino para o Firebase Authentication SDK.
 * ==========================================================
 */

import { auth } from "./config.js";

import {
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* ==========================================================
   Login
========================================================== */

export async function login(email, password) {

    return await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

}

/* ==========================================================
   Logout
========================================================== */

export async function logout() {

    return await signOut(auth);

}

/* ==========================================================
   Recuperação de senha
========================================================== */

export async function resetPassword(email) {

    return await sendPasswordResetEmail(
        auth,
        email
    );

}

/* ==========================================================
   Atualização do perfil
========================================================== */

export async function updateCurrentUser(data) {

    if (!auth.currentUser) {

        throw new Error("Usuario nao autenticado.");

    }

    return await updateProfile(
        auth.currentUser,
        data
    );

}

/* ==========================================================
   Usuário Atual
========================================================== */

export function getCurrentUser() {
    return auth.currentUser;
}

/* ==========================================================
   Sessão
========================================================== */

export function isAuthenticated() {
    return auth.currentUser !== null;
}

/* ==========================================================
   Listener
========================================================== */

export function onUserStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
}
