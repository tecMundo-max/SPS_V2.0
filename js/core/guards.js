/**
 * ==========================================================
 * SPS v2
 * Arquivo: guards.js
 * Responsabilidade:
 * Proteção de páginas e controle de permissões.
 * ==========================================================
 */

import { hasSession, waitForSession, getUid } from "./session.js";
import { findChild } from "../firebase/database.js";
import { DB_PATHS, USER_ROLES } from "../config/constants.js";

/**
 * Perfil carregado do usuário
 */
let currentProfile = null;

/**
 * Página de login
 */
const LOGIN_PAGE = "../login.html";

/**
 * Redireciona para login
 */
function redirectToLogin() {

    window.location.replace(LOGIN_PAGE);

}

/**
 * Carrega perfil do usuário
 */
async function loadProfile() {

    const uid = getUid();

    if (!uid) {

        return null;

    }

    const response = await findChild(DB_PATHS.USERS, uid);

    if (!response.success) {

        return null;

    }

    currentProfile = response.data;

    return currentProfile;

}

/**
 * Retorna perfil carregado
 */
export function getProfile() {

    return currentProfile;

}

/**
 * Retorna papel do usuário
 */
export function getRole() {

    return currentProfile ? .perfil ? ? null;

}

/**
 * Usuário é Administrador
 */
export function isAdmin() {

    return getRole() === USER_ROLES.ADMIN;

}

/**
 * Usuário é Supervisor
 */
export function isSupervisor() {

    return getRole() === USER_ROLES.SUPERVISOR;

}

/**
 * Usuário é Operador
 */
export function isOperator() {

    return getRole() === USER_ROLES.OPERATOR;

}

/**
 * Verifica se usuário está ativo
 */
export function isActive() {

    return currentProfile ? .ativo === true;

}

/**
 * Proteção básica
 */
export async function protectPage() {

    if (!hasSession()) {

        try {

            await waitForSession();

        } catch {

            redirectToLogin();

            return false;

        }

    }

    const profile = await loadProfile();

    if (!profile) {

        redirectToLogin();

        return false;

    }

    if (!profile.ativo) {

        alert("Usuário desativado.");

        redirectToLogin();

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

        window.location.replace("../dashboard.html");

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

    if (isAdmin()) {

        return true;

    }

    if (isSupervisor()) {

        return true;

    }

    return ownerUid === getUid();

}

/**
 * Pode excluir?
 */
export function canDelete() {

    return isAdmin();

}

/**
 * Pode cadastrar usuários?
 */
export function canManageUsers() {

    return isAdmin();

}

/**
 * Pode acessar configurações?
 */
export function canManageSettings() {

    return isAdmin();

}

/**
 * Pode exportar?
 */
export function canExport() {

    return hasSession();

}

/**
 * Pode visualizar logs?
 */
export function canViewLogs() {

    return isAdmin();

}