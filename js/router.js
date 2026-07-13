/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/router.js
 * Responsabilidade:
 * Controle central de rotas e redirecionamentos principais.
 * ==========================================================
 */

import {
    getProfile,
    isAuthenticated
} from "./core/appContext.js";

const DEFAULT_AUTHENTICATED_PAGE = "dashboard.html";
const LOGIN_PAGE = "login.html";

const ROUTES = Object.freeze({
    "/": {
        entry: true
    },
    "/index.html": {
        entry: true
    },
    "/login.html": {
        publicOnly: true,
        module: "./pages/login.js"
    },
    "/dashboard.html": {
        protected: true,
        module: "./pages/dashboard.js"
    },
    "/chamados.html": {
        protected: true
    },
    "/encaminhamentos.html": {
        protected: true
    },
    "/relatorios.html": {
        protected: true
    },
    "/usuarios.html": {
        protected: true,
        roles: ["SUPERVISOR"]
    },
    "/configuracoes.html": {
        protected: true,
        roles: ["SUPERVISOR"]
    }
});

function getPathname() {
    return window.location.pathname.replace(/\\/g, "/");
}

function getRoute() {
    const pathname = getPathname();

    const routeName = Object.keys(ROUTES).find((route) => {
        return pathname.endsWith(route);
    });

    return ROUTES[routeName] || {
        protected: true
    };
}

function redirectTo(page) {
    if (!window.location.pathname.endsWith(page)) {
        window.location.replace(page);
    }
}

function hasRequiredRole(route) {
    if (!route.roles || route.roles.length === 0) {
        return true;
    }

    return route.roles.includes(getProfile()?.perfil);
}

async function loadRouteModule(route) {
    if (!route.module) {
        return null;
    }

    const module = await
    import (route.module);

    if (typeof module.initializePage === "function") {
        await module.initializePage();
    }

    return module;
}

export async function initialize() {
    const route = getRoute();
    const profile = getProfile();

    if (route.entry) {
        navigateToDefaultRoute();

        return {
            redirected: true
        };
    }

    if (
        route.publicOnly &&
        isAuthenticated() &&
      profile?.ativo === true
    ) {
        navigateToDefaultAuthenticatedPage();

        return {
            redirected: true
        };
    }

    if (
        route.protected &&
        (!isAuthenticated() ||
            !profile ||
            profile.ativo !== true
        )
    ) {
        navigateToLogin();

        return {
            redirected: true
        };
    }

    if (
        route.protected &&
        !hasRequiredRole(route)
    ) {
        navigateToDefaultAuthenticatedPage();

        return {
            redirected: true
        };
    }

    await loadRouteModule(route);

    return {
        redirected: false
    };
}

export function navigateToDefaultRoute() {
    if (isAuthenticated()) {
        navigateToDefaultAuthenticatedPage();
        return;
    }

    navigateToLogin();
}

export function navigateToDefaultAuthenticatedPage() {
    redirectTo(DEFAULT_AUTHENTICATED_PAGE);
}

export function navigateToLogin() {
    redirectTo(LOGIN_PAGE);
}

export default {
    initialize,
    navigateToDefaultRoute,
    navigateToDefaultAuthenticatedPage,
    navigateToLogin
};
