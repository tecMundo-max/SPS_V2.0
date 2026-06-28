/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/firebase/auth.js
 * Versão: 3.0 (Produção)
 * Responsabilidade:
 * Camada única de autenticação Firebase.
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
   Mensagens
========================================================== */

const AUTH_ERRORS = Object.freeze({
    "auth/invalid-email": "E-mail inválido.",
    "auth/missing-password": "Informe a senha.",
    "auth/user-disabled": "Usuário desativado.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha inválidos.",
    "auth/network-request-failed": "Falha de conexão.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos."
});

function response(success, data = null, message = "", error = null) {
    return {
        success,
        data,
        message,
        error
    };
}

function errorMessage(error) {
    return AUTH_ERRORS[error.code] || "Erro inesperado de autenticação.";
}

/* ==========================================================
   Login
========================================================== */

export async function login(email, password) {

    try {

        const credential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return response(
            true,
            credential.user,
            "Login realizado com sucesso."
        );

    } catch (error) {

        return response(
            false,
            null,
            errorMessage(error),
            error
        );

    }

}

/* ==========================================================
   Logout
========================================================== */

export async function logout() {

    try {

        await signOut(auth);

        return response(
            true,
            null,
            "Logout realizado."
        );

    } catch (error) {

        return response(
            false,
            null,
            "Não foi possível finalizar a sessão.",
            error
        );

    }

}

/* ==========================================================
   Recuperação de senha
========================================================== */

export async function resetPassword(email) {

    try {

        await sendPasswordResetEmail(auth, email);

        return response(
            true,
            null,
            "E-mail de recuperação enviado."
        );

    } catch (error) {

        return response(
            false,
            null,
            errorMessage(error),
            error
        );

    }

}

/* ==========================================================
   Atualização do perfil
========================================================== */

export async function updateCurrentUser(data) {

    try {

        if (!auth.currentUser) {

            return response(
                false,
                null,
                "Usuário não autenticado."
            );

        }

        await updateProfile(auth.currentUser, data);

        return response(
            true,
            auth.currentUser,
            "Perfil atualizado."
        );

    } catch (error) {

        return response(
            false,
            null,
            "Erro ao atualizar perfil.",
            error
        );

    }

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
