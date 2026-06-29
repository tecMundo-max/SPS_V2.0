/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/services/encaminhamentosService.js
 * Responsabilidade:
 * Regras e acesso a dados de encaminhamentos.
 * ==========================================================
 */

import {
    create,
    findChild,
    edit,
    destroy,
    list
} from "../firebase/database.js";

import { DB_PATHS } from "../config/constants.js";

import {
    applyFilters,
    createTimestamp,
    normalize,
    validateRequired,
    successResponse,
} from "./baseService.js";

const ENCAMINHAMENTOS_PATH = DB_PATHS.EMAILS;
const HISTORICO_PATH = DB_PATHS.EMAIL_HISTORY;

function encaminhamentoPath(id) {

    return `${ENCAMINHAMENTOS_PATH}/${id}`;

}

function historicoPath(id) {

    return `${HISTORICO_PATH}/${id}`;

}

export async function createEncaminhamento(data = {}) {

    const now = createTimestamp();

    return await create(ENCAMINHAMENTOS_PATH, normalize({
        ...data,
        criadoEm: data.criadoEm || now,
        atualizadoEm: data.atualizadoEm || now
    }));

}

export async function updateEncaminhamento(id, data = {}) {

    const validation = validateRequired({ id }, ["id"]);

    if (validation) {

        return validation;

    }

    return await edit(encaminhamentoPath(id), normalize({
        ...data,
        atualizadoEm: createTimestamp()
    }));

}

export async function getEncaminhamento(id) {

    const validation = validateRequired({ id }, ["id"]);

    if (validation) {

        return validation;

    }

    return await findChild(ENCAMINHAMENTOS_PATH, id);

}

export async function deleteEncaminhamento(id) {

    const validation = validateRequired({ id }, ["id"]);

    if (validation) {

        return validation;

    }

    return await destroy(encaminhamentoPath(id));

}

export async function listEncaminhamentos(filters = {}) {

    const response = await list(ENCAMINHAMENTOS_PATH);

    if (!response.success) {

        return response;

    }

    return {
        ...response,
        data: applyFilters(response.data, filters)
    };

}

export async function addHistorico(encaminhamentoId, data = {}) {

    const validation = validateRequired({ encaminhamentoId }, ["encaminhamentoId"]);

    if (validation) {

        return validation;

    }

    return await create(historicoPath(encaminhamentoId), normalize({
        ...data,
        criadoEm: data.criadoEm || createTimestamp()
    }));

}

export async function getHistorico(encaminhamentoId) {

    const validation = validateRequired({ encaminhamentoId }, ["encaminhamentoId"]);

    if (validation) {

        return validation;

    }

    return await list(historicoPath(encaminhamentoId));

}

export async function exportEncaminhamentos(filters = {}) {

    const response = await listEncaminhamentos(filters);

    if (!response.success) {

        return response;

    }

    return successResponse({
        geradoEm: createTimestamp(),
        filtros: filters,
        items: response.data
    });

}

export default {
    createEncaminhamento,
    updateEncaminhamento,
    getEncaminhamento,
    deleteEncaminhamento,
    listEncaminhamentos,
    addHistorico,
    getHistorico,
    exportEncaminhamentos
};
