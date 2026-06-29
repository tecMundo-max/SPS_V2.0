/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/services/relatoriosService.js
 * Responsabilidade:
 * Geracao de dados para relatorios.
 * ==========================================================
 */

import { getDashboardData } from "./dashboardService.js";
import { listEncaminhamentos } from "./encaminhamentosService.js";
import { listFechamentos } from "./fechamentosService.js";
import { listUsers } from "./usersService.js";

import {
    applyFilters,
    createTimestamp,
    successResponse,
} from "./baseService.js";

function reportResponse(type, items, filters = {}) {

    return successResponse({
        tipo: type,
        geradoEm: createTimestamp(),
        filtros: filters,
        items
    });

}

export async function getDashboardReport() {

    const response = await getDashboardData();

    if (!response.success) {

        return response;

    }

    return reportResponse("dashboard", response.data);

}

export async function getEncaminhamentosReport(filters = {}) {

    const response = await listEncaminhamentos(filters);

    if (!response.success) {

        return response;

    }

    return reportResponse("encaminhamentos", response.data, filters);

}

export async function getFechamentosReport(filters = {}) {

    const response = await listFechamentos();

    if (!response.success) {

        return response;

    }

    return reportResponse(
        "fechamentos",
        applyFilters(response.data, filters),
        filters
    );

}

export async function getUsersReport(filters = {}) {

    const response = await listUsers();

    if (!response.success) {

        return response;

    }

    return reportResponse(
        "usuarios",
        applyFilters(response.data, filters),
        filters
    );

}

export default {
    getDashboardReport,
    getEncaminhamentosReport,
    getFechamentosReport,
    getUsersReport
};
