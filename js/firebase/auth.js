/**
 * ==========================================================
 * SPS v2
 * Arquivo: auth.js
 * Responsabilidade:
 * Camada de autenticação do Firebase.
 * ==========================================================
 */

import { auth } from "./config.js";

import {
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

function normalizeEmail(email) {
    return String(email ?? "").trim().toLowerCase();
}

function validateRequired(value, fieldName) {
    if (String(value ?? "").trim() === "") {
        throw new Error(`${fieldName} é obrigatório.`);
    }
}

/**
 * Login
 */
export async function login(email, password) {
    const normalizedEmail = normalizeEmail(email);

    validateRequired(normalizedEmail, "E-mail");
    validateRequired(password, "Senha");

    return await signInWithEmailAndPassword(auth, normalizedEmail, password);
}

/**
 * Logout
 */
export async function logout() {
    return await signOut(auth);
}

/**
 * Recuperação de senha
 */
export async function resetPassword(email) {
    const normalizedEmail = normalizeEmail(email);

    validateRequired(normalizedEmail, "E-mail");

    return await sendPasswordResetEmail(auth, normalizedEmail);
}

/**
 * Usuário atual
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
 * Observador de sessão
 */
export function onUserChanged(callback) {
    if (typeof callback !== "function") {
        throw new Error("Callback de autenticação inválido.");
    }

    return onAuthStateChanged(auth, callback);
}

/**
 * Atualiza perfil
 */
export async function updateUserProfile(data) {
    if (!auth.currentUser) {
        throw new Error("Usuário não autenticado.");
    }

    if (!data || typeof data !== "object") {
        throw new Error("Dados de perfil inválidos.");
    }

    return await updateProfile(auth.currentUser, data);
}
