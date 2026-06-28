/**
 * ==========================================================
 * SPS v2
 * Arquivo: database.js
 * Responsabilidade:
 * Camada única de acesso ao Firebase Realtime Database.
 * Nenhuma página deve acessar o Firebase diretamente.
 * ==========================================================
 */

import { db } from "./config.js";

import {
    ref,
    push,
    set,
    get,
    update,
    remove,
    child,
    query,
    orderByChild,
    equalTo
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

/**
 * Padronização de resposta
 */
function createResponse(success, data = null, message = "", error = null) {

    return {
        success,
        data,
        message,
        error
    };

}

/**
 * Criar registro
 */
export async function create(path, data) {

    try {

        const newRef = push(ref(db, path));

        await set(newRef, data);

        return createResponse(
            true, {
                id: newRef.key,
                ...data
            },
            "Registro criado com sucesso."
        );

    } catch (error) {

        return createResponse(
            false,
            null,
            "Erro ao criar registro.",
            error.message
        );

    }

}

/**
 * Criar utilizando ID informado
 */
export async function createWithId(path, id, data) {

    try {

        await set(ref(db, `${path}/${id}`), data);

        return createResponse(
            true, {
                id,
                ...data
            },
            "Registro criado com sucesso."
        );

    } catch (error) {

        return createResponse(
            false,
            null,
            "Erro ao criar registro.",
            error.message
        );

    }

}

/**
 * Buscar registro
 */
export async function find(path) {

    try {

        const snapshot = await get(ref(db, path));

        if (!snapshot.exists()) {

            return createResponse(
                false,
                null,
                "Registro não encontrado."
            );

        }

        return createResponse(
            true,
            snapshot.val()
        );

    } catch (error) {

        return createResponse(
            false,
            null,
            "Erro ao consultar registro.",
            error.message
        );

    }

}

/**
 * Buscar filho
 */
export async function findChild(path, id) {

    return await find(`${path}/${id}`);

}

/**
 * Atualizar registro
 */
export async function edit(path, data) {

    try {

        await update(ref(db, path), data);

        return createResponse(
            true,
            data,
            "Registro atualizado."
        );

    } catch (error) {

        return createResponse(
            false,
            null,
            "Erro ao atualizar.",
            error.message
        );

    }

}

/**
 * Exclusão física
 * (Admin apenas)
 */
export async function destroy(path) {

    try {

        await remove(ref(db, path));

        return createResponse(
            true,
            null,
            "Registro removido."
        );

    } catch (error) {

        return createResponse(
            false,
            null,
            "Erro ao remover registro.",
            error.message
        );

    }

}

/**
 * Exclusão lógica
 */
export async function softDelete(path, uid) {

    try {

        await update(ref(db, path), {

            deleted: true,
            deletedAt: Date.now(),
            deletedBy: uid

        });

        return createResponse(
            true,
            null,
            "Registro excluído."
        );

    } catch (error) {

        return createResponse(
            false,
            null,
            "Erro ao excluir.",
            error.message
        );

    }

}

/**
 * Restaurar registro
 */
export async function restore(path) {

    try {

        await update(ref(db, path), {

            deleted: false,
            deletedAt: null,
            deletedBy: null

        });

        return createResponse(
            true,
            null,
            "Registro restaurado."
        );

    } catch (error) {

        return createResponse(
            false,
            null,
            "Erro ao restaurar.",
            error.message
        );

    }

}

/**
 * Listar registros
 */
export async function list(path) {

    try {

        const snapshot = await get(ref(db, path));

        if (!snapshot.exists()) {

            return createResponse(
                true, []
            );

        }

        const result = [];

        snapshot.forEach(item => {

            result.push({

                id: item.key,
                ...item.val()

            });

        });

        return createResponse(
            true,
            result
        );

    } catch (error) {

        return createResponse(
            false, [],
            "Erro ao listar registros.",
            error.message
        );

    }

}

/**
 * Buscar por campo
 */
export async function findByField(path, field, value) {

    try {

        const q = query(
            ref(db, path),
            orderByChild(field),
            equalTo(value)
        );

        const snapshot = await get(q);

        const result = [];

        snapshot.forEach(item => {

            result.push({

                id: item.key,
                ...item.val()

            });

        });

        return createResponse(
            true,
            result
        );

    } catch (error) {

        return createResponse(
            false, [],
            "Erro na pesquisa.",
            error.message
        );

    }

}

/**
 * Verifica existência
 */
export async function exists(path) {

    try {

        const snapshot = await get(ref(db, path));

        return snapshot.exists();

    } catch {

        return false;

    }

}

/**
 * Retorna referência
 */
export function getReference(path) {

    return ref(db, path);

}