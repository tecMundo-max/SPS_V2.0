/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/core/authController.js
 * Responsabilidade:
 * Fachada de autenticacao para a camada Pages.
 * ==========================================================
 */

import {
    login,
    logout,
    resetPassword
} from "../services/authService.js";

export async function loginUser(email, password) {

    return await login(email, password);

}

export async function logoutUser() {

    return await logout();

}

export async function recoverPassword(email) {

    return await resetPassword(email);

}

export default {
    loginUser,
    logoutUser,
    recoverPassword
};

