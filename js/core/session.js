/**
 * ==========================================================
 * SPS v2
 * Arquivo: session.js
 * Responsabilidade:
 * Gerenciar a sessão do usuário autenticado.
 * ==========================================================
 */

import {
    initialize,
    getCurrentUser as getContextCurrentUser,
    setCurrentUser,
    clear as clearContext,
    isAuthenticated as contextIsAuthenticated,
    refreshCurrentUser
} from "./appContext.js";

import {
    onAuthStateChanged
} from "../services/authService.js";

/**
 * Inicializa a sessão
 */
export async function initSession() {

    const context = await initialize();

    return context.currentUser;

}

export async function initializeSession() {

    return await initSession();

}

/**
 * Retorna o usuário autenticado
 */
export function getSession() {

    return getContextCurrentUser();

}

/**
 * Retorna o UID
 */
export function getUid() {

    return getContextCurrentUser()?.uid ?? null;

}

/**
 * Retorna o e-mail
 */
export function getEmail() {

    return getContextCurrentUser()?.email ?? null;

}

/**
 * Retorna o nome
 */
export function getDisplayName() {

    return getContextCurrentUser()?.displayName ?? "";

}

/**
 * Retorna foto
 */
export function getPhotoURL() {

    return getContextCurrentUser()?.photoURL ?? "";

}

/**
 * Usuário autenticado?
 */
export function hasSession() {

    return contextIsAuthenticated();

}

/**
 * Atualiza sessão
 */
export function refreshSession() {

    return refreshCurrentUser();

}

/**
 * Limpa sessão local
 */
export function clearSession() {

    clearContext();

}

/**
 * Escuta alterações de autenticação
 */
export function watchSession(callback) {

    return onAuthStateChanged((user) => {

        setCurrentUser(user);

        if (typeof callback === "function") {

            callback(user);

        }

    });

}

/**
 * Aguarda sessão válida
 */
export async function waitForSession(timeout = 10000) {

    return new Promise((resolve, reject) => {

        const timer = setTimeout(() => {

            unsubscribe();

            reject(new Error("Tempo limite aguardando sessão."));

        }, timeout);

        const unsubscribe = onAuthStateChanged((user) => {

            if (!user) {

                return;

            }

            clearTimeout(timer);

            setCurrentUser(user);

            unsubscribe();

            resolve(user);

        });

    });

}

/**
 * Dados resumidos do usuário
 */
export function getSessionInfo() {

    const currentSession = getContextCurrentUser();

    if (!currentSession) {

        return null;

    }

    return {

        uid: currentSession.uid,
        email: currentSession.email,
        displayName: currentSession.displayName,
        photoURL: currentSession.photoURL,
        emailVerified: currentSession.emailVerified,
        anonymous: currentSession.isAnonymous

    };

}
