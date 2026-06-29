/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/bootstrap.js
 * Responsabilidade:
 * Ponto unico de inicializacao da aplicacao.
 * ==========================================================
 */

import {
    initialize as initializeAppContext
} from "./core/appContext.js";

import {
    initialize as initializeRouter
} from "./router.js";

import {
    initializeSession
} from "./core/session.js";

let initialized = false;

export async function initializeApplication() {

    if (initialized) {

        return true;

    }

    document.documentElement.dataset.app = "sps-v2";

    await initializeAppContext();
    await initializeRouter();
    await initializeSession();

    initialized = true;

    return true;

}

window.addEventListener("DOMContentLoaded", () => {

    initializeApplication().catch((error) => {

        console.error("BOOTSTRAP ERROR:", error);

    });

});

export default {
    initializeApplication
};

