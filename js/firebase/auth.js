/**
 * ==========================================================
 * SPS v2
 * Arquivo: auth.js
 * Responsabilidade:
 * Camada única de autenticação do sistema.
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

/**
 * Traduz erros do Firebase Authentication
 */
function getAuthErrorMessage(errorCode) {

    const messages = {
        "auth/invalid-email": "E-mail inválido.",
        "auth/missing-password": "Informe a senha.",
        "auth/user-disabled": "Usuário desativado.",
        "auth/user-not-found": "Usuário não encontrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-credential": "E-mail ou senha inválidos.",
        "auth/network-request-failed": "Erro de conexão.",
        "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos."
    };

    return messages[errorCode] || "Erro inesperado na autenticação.";
}

/**
 * Padroniza retorno
 */
function createResponse(success, data = null, message = "", error = null) {

    return {
        success,
        data,
        message,
        error
    };

}

/**
 * Login
 */
export async function login(email, password) {

    try {

        const credential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return createResponse(
            true,
            credential.user,
            "Login realizado com sucesso."
        );

    } catch (error) {

        return createResponse(
            false,
            null,
            getAuthErrorMessage(error.code),
            error.code
        );

    }

}

/**
 * Logout
 */
export async function logout() {

    try {

        await signOut(auth);

        return createResponse(
            true,
            null,
            "Logout realizado com sucesso."
        );

    } catch (error) {

        return createResponse(
            false,
            null,
            "Erro ao realizar logout.",
            error.code
        );

    }

}

/**
 * Recuperação de senha
 */
export async function resetPassword(email) {

    try {

        await sendPasswordResetEmail(auth, email);

        return createResponse(
            true,
            null,
            "E-mail de recuperação enviado."
        );

    } catch (error) {

        return createResponse(
            false,
            null,
            getAuthErrorMessage(error.code),
            error.code
        );

    }

}

/**
 * Atualiza perfil do usuário
 */
export async function updateUser(userData) {

    try {

        if (!auth.currentUser) {

            return createResponse(
                false,
                null,
                "Usuário não autenticado."
            );

        }

        await updateProfile(auth.currentUser, userData);

        return createResponse(
            true,
            auth.currentUser,
            "Perfil atualizado com sucesso."
        );

    } catch (error) {

        return createResponse(
            false,
            null,
            "Erro ao atualizar perfil.",
            error.code
        );

    }

}

/**
 * Retorna usuário autenticado
 */
export function getCurrentUser() {

    return auth.currentUser;

}

/**
 * Verifica autenticação
 */
export function isAuthenticated() {

    return auth.currentUser !== null;

}

/**
 * Observador de autenticação
 */
export function onUserStateChange(callback) {

    return onAuthStateChanged(auth, callback);

}
