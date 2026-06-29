/**
 * ==========================================================
 * SPS v2
 * Arquivo: usersController.js
 * Responsabilidade:
 * Controlar as operações do módulo de usuários.
 * Faz validações antes de chamar o Service.
 * ==========================================================
 */

import {

    getCurrentUser

} from "../firebase/auth.js";

import {

    USER_PROFILES

} from "../config/constants.js";

import {

    getUser,
    getUserProfile,
    listUsers,
    createUser,
    updateUser,
    activateUser,
    deactivateUser,
    softDeleteUser,
    restoreUser,
    changeProfile,
    updateLastLogin

} from "../services/usersService.js";

/**
 * Usuário autenticado
 */
async function currentProfile() {

    const authUser = getCurrentUser();

    if (!authUser) {

        return null;

    }

    const result = await getUserProfile(

        authUser.uid

    );

    if (!result.success) {

        return null;

    }

    return result.data;

}

/**
 * Verifica Supervisor
 */
async function isSupervisor() {

    const profile = await currentProfile();

    if (!profile) {

        return false;

    }

    return profile.perfil === USER_PROFILES.SUPERVISOR;

}

/**
 * Consultar usuário
 */
export async function findUser(uid) {

    return await getUser(uid);

}

/**
 * Meu perfil
 */
export async function myProfile() {

    const authUser = getCurrentUser();

    if (!authUser) {

        return {

            success: false,
            message: "Usuário não autenticado."

        };

    }

    return await getUserProfile(

        authUser.uid

    );

}

/**
 * Listar usuários
 */
export async function findAllUsers() {

    if (!(await isSupervisor())) {

        return {

            success: false,
            message: "Acesso negado."

        };

    }

    return await listUsers();

}

/**
 * Criar usuário
 */
export async function createNewUser(uid, data) {

    if (!(await isSupervisor())) {

        return {

            success: false,
            message: "Acesso negado."

        };

    }

    return await createUser(

        uid,
        data

    );

}

/**
 * Atualizar usuário
 */
export async function saveUser(uid, data) {

    if (!(await isSupervisor())) {

        return {

            success: false,
            message: "Acesso negado."

        };

    }

    return await updateUser(

        uid,
        data

    );

}

/**
 * Ativar
 */
export async function enableUser(uid) {

    const auth = getCurrentUser();

    if (!(await isSupervisor())) {

        return {

            success: false,
            message: "Acesso negado."

        };

    }

    return await activateUser(

        uid,
        auth.uid

    );

}

/**
 * Inativar
 */
export async function disableUser(uid) {

    const auth = getCurrentUser();

    if (!(await isSupervisor())) {

        return {

            success: false,
            message: "Acesso negado."

        };

    }

    return await deactivateUser(

        uid,
        auth.uid

    );

}

/**
 * Exclusão lógica
 */
export async function deleteUser(uid) {

    const auth = getCurrentUser();

    if (!(await isSupervisor())) {

        return {

            success: false,
            message: "Acesso negado."

        };

    }

    return await softDeleteUser(

        uid,
        auth.uid

    );

}

/**
 * Restaurar
 */
export async function undeleteUser(uid) {

    const auth = getCurrentUser();

    if (!(await isSupervisor())) {

        return {

            success: false,
            message: "Acesso negado."

        };

    }

    return await restoreUser(

        uid,
        auth.uid

    );

}

/**
 * Alterar perfil
 */
export async function updateProfile(uid, perfil) {

    const auth = getCurrentUser();

    if (!(await isSupervisor())) {

        return {

            success: false,
            message: "Acesso negado."

        };

    }

    return await changeProfile(

        uid,
        perfil,
        auth.uid

    );

}

/**
 * Atualizar último login
 */
export async function refreshLastLogin() {

    const auth = getCurrentUser();

    if (!auth) {

        return;

    }

    return await updateLastLogin(

        auth.uid

    );

}