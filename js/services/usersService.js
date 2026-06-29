/**
 * ==========================================================
 * SPS v2
 * Arquivo: usersService.js
 * Responsabilidade:
 * Regras de negócio relacionadas aos usuários.
 * ==========================================================
 */

import {

    createWithId,
    findChild,
    list,
    edit

} from "../firebase/database.js";

import {

    DB_PATHS,
    USER_PROFILES

} from "../config/constants.js";

/**
 * Caminho da coleção
 */
const USERS_PATH = DB_PATHS.USERS;

/**
 * Timestamp atual
 */
function now() {

    return Date.now();

}

/**
 * Modelo padrão
 */
function createUserModel(data = {}) {

    return {

        nome: data.nome || "",

        email: data.email || "",

        perfil: data.perfil || USER_PROFILES.ANALISTA,

        ativo: data.ativo ? ? true,

        ultimoLogin: data.ultimoLogin || 0,

        createdAt: data.createdAt || now(),

        updatedAt: data.updatedAt || now(),

        createdBy: data.createdBy || "",

        updatedBy: data.updatedBy || "",

        deleted: false

    };

}

/**
 * Buscar usuário
 */
export async function getUser(uid) {

    return await findChild(

        USERS_PATH,
        uid

    );

}

/**
 * Buscar perfil
 */
export async function getUserProfile(uid) {

    return await getUser(uid);

}

/**
 * Listar usuários
 */
export async function listUsers() {

    return await list(

        USERS_PATH

    );

}

/**
 * Criar usuário
 */
export async function createUser(uid, data) {

    const user = createUserModel(data);

    return await createWithId(

        USERS_PATH,
        uid,
        user

    );

}

/**
 * Criar automaticamente caso não exista
 */
export async function createIfNotExists(firebaseUser) {

    const exists = await getUser(firebaseUser.uid);

    if (exists.success) {

        return exists;

    }

    return await createUser(

        firebaseUser.uid,

        {

            nome: firebaseUser.displayName || "",

            email: firebaseUser.email,

            perfil: USER_PROFILES.ANALISTA,

            createdBy: firebaseUser.uid,

            updatedBy: firebaseUser.uid

        }

    );

}

/**
 * Atualizar usuário
 */
export async function updateUser(uid, data) {

    data.updatedAt = now();

    return await edit(

        `${USERS_PATH}/${uid}`,

        data

    );

}

/**
 * Ativar usuário
 */
export async function activateUser(uid, updatedBy) {

    return await updateUser(

        uid,

        {

            ativo: true,

            updatedBy

        }

    );

}

/**
 * Inativar usuário
 */
export async function deactivateUser(uid, updatedBy) {

    return await updateUser(

        uid,

        {

            ativo: false,

            updatedBy

        }

    );

}

/**
 * Exclusão lógica
 */
export async function softDeleteUser(uid, updatedBy) {

    return await updateUser(

        uid,

        {

            deleted: true,

            updatedBy

        }

    );

}

/**
 * Restaurar usuário
 */
export async function restoreUser(uid, updatedBy) {

    return await updateUser(

        uid,

        {

            deleted: false,

            updatedBy

        }

    );

}

/**
 * Alterar perfil
 */
export async function changeProfile(uid, perfil, updatedBy) {

    return await updateUser(

        uid,

        {

            perfil,

            updatedBy

        }

    );

}

/**
 * Atualizar último login
 */
export async function updateLastLogin(uid) {

    return await updateUser(

        uid,

        {

            ultimoLogin: now()

        }

    );

}