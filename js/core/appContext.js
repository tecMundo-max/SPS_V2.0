/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/core/appContext.js
 * Responsabilidade:
 * Contexto central da aplicação e sessão.
 * ==========================================================
 */

import {
    getAuthenticatedUser,
    onAuthStateChanged
} from "../services/authService.js";

import {
    getUserProfile
} from "../services/usersService.js";

import {
    USER_PROFILES
} from "../config/constants.js";

const context = {
    currentUser: null,
    profile: null,
    permissions: null,
    settings: null,
    initialized: false
};

let authUnsubscribe = null;
let initializePromise = null;

function createPermissions(profile) {

    const role = profile ? profile.perfil : null;
    const active = profile ? profile.ativo === true : false;

    return {

        role,
        active,

        isSupervisor: role === USER_PROFILES.SUPERVISOR,
        isAnalista: role === USER_PROFILES.ANALISTA,

        canEdit: role === USER_PROFILES.SUPERVISOR,
        canDelete: role === USER_PROFILES.SUPERVISOR,

        canManageUsers: role === USER_PROFILES.SUPERVISOR,
        canManageSettings: role === USER_PROFILES.SUPERVISOR,

        canExport: active,

        canViewLogs: role === USER_PROFILES.SUPERVISOR

    };

}

async function loadProfile(user) {

    if (!user || !user.uid) {

        setProfile(null);
        setPermissions(createPermissions(null));

        return null;

    }

    const response = await getUserProfile(user.uid);

    if (!response.success) {

        setProfile(null);
        setPermissions(createPermissions(null));

        return null;

    }

    setProfile(response.data);
    setPermissions(createPermissions(response.data));

    return response.data;

}

async function applyAuthUser(user) {

    setCurrentUser(user);

    if (!user) {

        setProfile(null);
        setPermissions(createPermissions(null));

        context.initialized = true;

        return context;

    }

    await loadProfile(user);

    context.initialized = true;

    return context;

}

export async function initialize() {

    if (context.initialized && authUnsubscribe) {

        return context;

    }

    if (initializePromise) {

        return await initializePromise;

    }

    initializePromise = new Promise((resolve) => {

        let resolved = false;

        authUnsubscribe = onAuthStateChanged(async(user) => {

            await applyAuthUser(user);

            if (!resolved) {

                resolved = true;

                resolve(context);

            }

        });

    });

    return await initializePromise;

}

export function setCurrentUser(user) {

    context.currentUser = user;

}

export function getCurrentUser() {

    return context.currentUser;

}

export function setProfile(profile) {

    context.profile = profile;

}

export function getProfile() {

    return context.profile;

}

export function setPermissions(permissions) {

    context.permissions = permissions;

}

export function getPermissions() {

    if (context.permissions) {

        return context.permissions;

    }

    return createPermissions(context.profile);

}

export function clear() {

    if (authUnsubscribe) {

        authUnsubscribe();

        authUnsubscribe = null;

    }

    context.currentUser = null;
    context.profile = null;
    context.permissions = createPermissions(null);
    context.settings = null;
    context.initialized = false;

    initializePromise = null;

}

export function isAuthenticated() {

    return context.currentUser !== null;

}

export function refreshCurrentUser() {

    setCurrentUser(getAuthenticatedUser());

    return getCurrentUser();

}

export default {

    initialize,

    setCurrentUser,
    getCurrentUser,

    setProfile,
    getProfile,

    setPermissions,
    getPermissions,

    clear,

    isAuthenticated,

    refreshCurrentUser

};