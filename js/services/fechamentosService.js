/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/services/fechamentosService.js
 * Responsabilidade:
 * CRUD de fechamentos.
 * ==========================================================
 */

import {
    create,
    findChild,
    edit,
    destroy,
    list
} from "../firebase/database.js";

import {
    createTimestamp,
    normalize,
    validateRequired
} from "./baseService.js";

const FECHAMENTOS_PATH = "fechamentos";

function fechamentoPath(id) {

    return `${FECHAMENTOS_PATH}/${id}`;

}

export async function createFechamento(data = {}) {

    const now = createTimestamp();

    return await create(FECHAMENTOS_PATH, normalize({
        ...data,
        criadoEm: data.criadoEm || now,
        atualizadoEm: data.atualizadoEm || now
    }));

}

export async function updateFechamento(id, data = {}) {

    const validation = validateRequired({ id }, ["id"]);

    if (validation) {

        return validation;

    }

    return await edit(fechamentoPath(id), normalize({
        ...data,
        atualizadoEm: createTimestamp()
    }));

}

export async function getFechamento(id) {

    const validation = validateRequired({ id }, ["id"]);

    if (validation) {

        return validation;

    }

    return await findChild(FECHAMENTOS_PATH, id);

}

export async function deleteFechamento(id) {

    const validation = validateRequired({ id }, ["id"]);

    if (validation) {

        return validation;

    }

    return await destroy(fechamentoPath(id));

}

export async function listFechamentos() {

    return await list(FECHAMENTOS_PATH);

}

export default {
    createFechamento,
    updateFechamento,
    getFechamento,
    deleteFechamento,
    listFechamentos
};
