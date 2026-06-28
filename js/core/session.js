/**
 * ==========================================================
 * SPS v2
 * Arquivo: session.js
 * Responsabilidade:
 * Gerenciar a sessão do usuário autenticado.
 * ==========================================================
 */

import { onUserStateChange, getCurrentUser } from "../firebase/auth.js";

let currentSession = null;

/**
 * Inicializa a sessão
 */
export function initSession() {

    return new Promise((resolve) => {

        onUserStateChange((user) => {

            currentSession = user;

            resolve(user);

        });

    });

}

/**
 * Retorna o usuário autenticado
 */
export function getSession() {

    return currentSession;

}

/**
 * Retorna o UID
 */
export function getUid() {

    return currentSession ? .uid ? ? null;

}

/**
 * Retorna o e-mail
 */
export function getEmail() {

    return currentSession ? .email ? ? null;

}

/**
 * Retorna o nome
 */
export function getDisplayName() {

    return currentSession ? .displayName ? ? "";

}

/**
 * Retorna foto
 */
export function getPhotoURL() {

    return currentSession ? .photoURL ? ? "";

}

/**
 * Usuário autenticado?
 */
export function hasSession() {

    return currentSession !== null;

}

/**
 * Atualiza sessão
 */
export function refreshSession() {

    currentSession = getCurrentUser();

    return currentSession;

}

/**
 * Limpa sessão local
 */
export function clearSession() {

    currentSession = null;

}

/**
 * Escuta alterações de autenticação
 */
export function watchSession(callback) {

    return onUserStateChange((user) => {

        currentSession = user;

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

        const unsubscribe = onUserStateChange((user) => {

            if (!user) {

                return;

            }

            clearTimeout(timer);

            currentSession = user;

            unsubscribe();

            resolve(user);

        });

    });

}

/**
 * Dados resumidos do usuário
 */
export function getSessionInfo() {

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