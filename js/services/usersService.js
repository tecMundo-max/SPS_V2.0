/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/services/usersService.js
 * Responsabilidade:
 * Regras e acesso a dados de usuarios.
 * ==========================================================
 */

import {
    createWithId,
    findChild,
    edit,
    destroy,
    list
} from "../firebase/database.js";

import { DB_PATHS, USER_ROLES } from "../config/constants.js";

import {
    createTimestamp,
    normalize,
    validateRequired
} from "./baseService.js";

const USERS_PATH = DB_PATHS.USERS;

function userPath(uid) {

    return `${USERS_PATH}/${uid}`;

}

function normalizeUser(user, overrides = {}) {

    return normalize({
        uid: user.uid,
        nome: user.nome || user.displayName || user.name || user.email || "",
        email: user.email || "",
        perfil: user.perfil || USER_ROLES.OPERATOR,
        ativo: user.ativo !== undefined ? user.ativo : true,
        ...overrides
    });

}

export async function createUser(user) {

    const validation = validateRequired(user, ["uid"]);

    if (validation) {

        return validation;

    }

    const now = createTimestamp();
    const data = normalizeUser(user, {
        criadoEm: user.criadoEm || now,
        ultimoLogin: user.ultimoLogin || now
    });

    return await createWithId(USERS_PATH, user.uid, data);

}

export async function createIfNotExists(user) {

    const validation = validateRequired(user, ["uid"]);

    if (validation) {

        return validation;

    }

    const now = createTimestamp();
    const existingUser = await getUser(user.uid);

    if (existingUser.success) {

        return await updateLastLogin(user.uid);

    }

    return await createUser({
        uid: user.uid,
        nome: user.displayName || user.nome || user.email || "",
        email: user.email || "",
        perfil: USER_ROLES.OPERATOR,
        ativo: true,
        criadoEm: now,
        ultimoLogin: now
    });

}

export async function getUser(uid) {

    const validation = validateRequired({ uid }, ["uid"]);

    if (validation) {

        return validation;

    }

    return await findChild(USERS_PATH, uid);

}

export async function updateUser(uid, data) {

    const validation = validateRequired({ uid }, ["uid"]);

    if (validation) {

        return validation;

    }

    return await edit(userPath(uid), normalize({
        ...data,
        atualizadoEm: createTimestamp()
    }));

}

export async function disableUser(uid) {

    return await updateUser(uid, {
        ativo: false
    });

}

export async function enableUser(uid) {

    return await updateUser(uid, {
        ativo: true
    });

}

export async function deleteUser(uid) {

    const validation = validateRequired({ uid }, ["uid"]);

    if (validation) {

        return validation;

    }

    return await destroy(userPath(uid));

}

export async function listUsers() {

    return await list(USERS_PATH);

}

export async function getUserProfile(uid) {

    return await getUser(uid);

}

export async function updateLastLogin(uid) {

    const validation = validateRequired({ uid }, ["uid"]);

    if (validation) {

        return validation;

    }

    return await edit(userPath(uid), {
        ultimoLogin: createTimestamp()
    });

}

export default {
    createUser,
    createIfNotExists,
    getUser,
    updateUser,
    disableUser,
    enableUser,
    deleteUser,
    listUsers,
    getUserProfile,
    updateLastLogin
};
