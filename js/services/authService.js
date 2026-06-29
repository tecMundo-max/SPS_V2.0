/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/services/authService.js
 * Responsabilidade:
 * Regras de autenticacao e sessao Firebase.
 * ==========================================================
 */

import {
    login as firebaseLogin,
    logout as firebaseLogout,
    resetPassword as firebaseResetPassword,
    updateCurrentUser,
    getCurrentUser,
    onUserStateChanged
} from "../firebase/auth.js";

import {
    createIfNotExists
} from "./usersService.js";

import {
    createServiceResponse,
    handleError
} from "./baseService.js";

const AUTH_ERRORS = Object.freeze({
    "auth/invalid-email": "E-mail invalido.",
    "auth/missing-password": "Informe a senha.",
    "auth/user-disabled": "Usuario desativado.",
    "auth/user-not-found": "Usuario nao encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha invalidos.",
    "auth/network-request-failed": "Falha de conexao.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos."
});

function authErrorMessage(error) {

    return AUTH_ERRORS[error?.code] || "Erro inesperado de autenticacao.";

}

export async function login(email, password) {

    try {

        const credential = await firebaseLogin(email, password);
        const profileResponse = await createIfNotExists(credential.user);

        if (!profileResponse.success) {

            return profileResponse;

        }

        return createServiceResponse(
            true,
            {
                user: credential.user,
                profile: profileResponse.data
            },
            "Login realizado com sucesso."
        );

    } catch (error) {

        return handleError(
            error,
            authErrorMessage(error)
        );

    }

}

export async function logout() {

    try {

        await firebaseLogout();

        return createServiceResponse(
            true,
            null,
            "Logout realizado."
        );

    } catch (error) {

        return handleError(
            error,
            "Nao foi possivel finalizar a sessao."
        );

    }

}

export async function resetPassword(email) {

    try {

        await firebaseResetPassword(email);

        return createServiceResponse(
            true,
            null,
            "E-mail de recuperacao enviado."
        );

    } catch (error) {

        return handleError(
            error,
            authErrorMessage(error)
        );

    }

}

export async function updateProfile(data) {

    try {

        await updateCurrentUser(data);

        return createServiceResponse(
            true,
            getCurrentUser(),
            "Perfil atualizado."
        );

    } catch (error) {

        return handleError(
            error,
            "Erro ao atualizar perfil."
        );

    }

}

export function onAuthStateChanged(callback) {

    return onUserStateChanged(callback);

}

export function getAuthenticatedUser() {

    return getCurrentUser();

}

export function refreshSession() {

    return getAuthenticatedUser();

}

export function isAuthenticated() {

    return getAuthenticatedUser() !== null;

}

export default {
    login,
    logout,
    resetPassword,
    updateProfile,
    onAuthStateChanged,
    getAuthenticatedUser,
    refreshSession,
    isAuthenticated
};

