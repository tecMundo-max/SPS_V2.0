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

import { USER_ROLES } from "../config/constants.js";

/**
 * Retorna perfil carregado
 */
export function getProfile() {

    return getContextProfile();

}

/**
 * Retorna papel do usuário
 */
export function getRole() {

    return getProfile()?.perfil ?? null;

}

/**
 * Usuário é Administrador
 */
export function isAdmin() {

    return getPermissions().isAdmin;

}

/**
 * Usuário é Supervisor
 */
export function isSupervisor() {

    return getPermissions().isSupervisor;

}

/**
 * Usuário é Operador
 */
export function isOperator() {

    return getPermissions().isOperator;

}

/**
 * Verifica se usuário está ativo
 */
export function isActive() {

    return getProfile()?.ativo === true;

}

/**
 * Proteção básica
 */
export async function protectPage() {

    await initialize();

    const profile = getProfile();

    if (!isAuthenticated() || !profile) {

        return false;

    }

    if (!profile.ativo) {

        alert("Usuário desativado.");

        return false;

    }

    return true;

}

/**
 * Permissão mínima
 */
export async function requireRole(...roles) {

    const ok = await protectPage();

    if (!ok) {

        return false;

    }

    if (!roles.includes(getRole())) {

        return false;

    }

    return true;

}

/**
 * Apenas Administrador
 */
export async function requireAdmin() {

    return await requireRole(

        USER_ROLES.ADMIN

    );

}

/**
 * Administrador ou Supervisor
 */
export async function requireSupervisor() {

    return await requireRole(

        USER_ROLES.ADMIN,
        USER_ROLES.SUPERVISOR

    );

}

/**
 * Todos autenticados
 */
export async function requireAuthenticated() {

    return await protectPage();

}

/**
 * Pode editar registro?
 */
export function canEdit(ownerUid) {

    if (getPermissions().canEdit) {

        return true;

    }

    return ownerUid === getCurrentUser()?.uid;

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
