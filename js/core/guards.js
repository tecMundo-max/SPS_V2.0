/**
 * ==========================================================
 * SPS v2
 * Arquivo: guards.js
 * Responsabilidade:
 * Proteção de páginas e controle de permissões.
 * ==========================================================
 */

import {
    initialize,
    getCurrentUser,
    getProfile as getContextProfile,
    getPermissions,
    isAuthenticated
} from "./appContext.js";

import {
    USER_PROFILES
} from "../config/constants.js";

/**
 * Retorna perfil carregado
 */
export function getProfile() {

    return getContextProfile();

}

/**
 * Retorna perfil do usuário
 */
export function getRole() {

    const profile = getProfile();

    if (!profile) {

        return null;

    }

    return profile.perfil;

}

/**
 * Usuário é Supervisor
 */
export function isSupervisor() {

    return getPermissions().isSupervisor;

}

/**
 * Usuário é Analista
 */
export function isAnalista() {

    return getPermissions().isAnalista;

}

/**
 * Verifica se usuário está ativo
 */
export function isActive() {

    const profile = getProfile();

    if (!profile) {

        return false;

    }

    return profile.ativo === true;

}

/**
 * Proteção básica
 */
export async function protectPage() {

    await initialize();

    const profile = getProfile();

    if (!isAuthenticated()) {

        return false;

    }

    if (!profile) {

        return false;

    }

    if (!profile.ativo) {

        alert("Usuário desativado.");

        return false;

    }

    return true;

}

/**
 * Exige um ou mais perfis
 */
export async function requireRole(...roles) {

    const ok = await protectPage();

    if (!ok) {

        return false;

    }

    return roles.includes(getRole());

}

/**
 * Apenas Supervisor
 */
export async function requireSupervisor() {

    return await requireRole(

        USER_PROFILES.SUPERVISOR

    );

}

/**
 * Supervisor ou Analista
 */
export async function requireAuthenticated() {

    return await requireRole(

        USER_PROFILES.SUPERVISOR,
        USER_PROFILES.ANALISTA

    );

}

/**
 * Pode editar?
 */
export function canEdit(ownerUid) {

    if (getPermissions().canEdit) {

        return true;

    }

    const user = getCurrentUser();

    if (!user) {

        return false;

    }

    return ownerUid === user.uid;

}

/**
 * Pode excluir?
 */
export function canDelete() {

    return getPermissions().canDelete;

}

/**
 * Pode cadastrar usuários?
 */
export function canManageUsers() {

    return getPermissions().canManageUsers;

}

/**
 * Pode acessar configurações?
 */
export function canManageSettings() {

    return getPermissions().canManageSettings;

}

/**
 * Pode exportar?
 */
export function canExport() {

    return getPermissions().canExport;

}

/**
 * Pode visualizar logs?
 */
export function canViewLogs() {

    return getPermissions().canViewLogs;

}