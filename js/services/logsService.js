/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/services/logsService.js
 * Responsabilidade:
 * Persistencia e consulta de logs.
 * ==========================================================
 */

import {
    create,
    findByField,
    list
} from "../firebase/database.js";

import { DB_PATHS } from "../config/constants.js";

import {
    applyFilters,
    createTimestamp,
    normalize
} from "./baseService.js";

const LOGS_PATH = DB_PATHS.LOGS;

export async function persistLog(logData = {}) {

    return await create(LOGS_PATH, normalize({
        ...logData,
        timestamp: logData.timestamp || createTimestamp()
    }));

}

export async function listLogs(filters = {}) {

    const response = await list(LOGS_PATH);

    if (!response.success) {

        return response;

    }

    return {
        ...response,
        data: applyFilters(response.data, filters)
    };

}

export async function getLogsByModule(moduleName) {

    return await findByField(LOGS_PATH, "module", moduleName);

}

export default {
    persistLog,
    listLogs,
    getLogsByModule
};
