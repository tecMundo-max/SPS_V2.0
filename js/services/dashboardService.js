/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/services/dashboardService.js
 * Responsabilidade:
 * Dados agregados para o Dashboard.
 * ==========================================================
 */

import { list } from "../firebase/database.js";
import { CALL_STATUS, DB_PATHS, EMAIL_STATUS } from "../config/constants.js";

import {
    createServiceResponse,
    sortByRecent
} from "./baseService.js";

const DATE_FIELDS = [
    "atualizadoEm",
    "updatedAt",
    "ultimoLogin",
    "criadoEm",
    "createdAt",
    "data"
];

function count(items, predicate) {

    return items.filter(predicate).length;

}

function getItems(response) {

    return response.success ? response.data : [];

}

function calculateDays(dateValue) {

    if (!dateValue) {

        return 0;

    }

    const date = new Date(dateValue).getTime();

    if (!date) {

        return 0;

    }

    const day = 24 * 60 * 60 * 1000;

    return Math.floor((Date.now() - date) / day);

}

function getUpdatedAt(item) {

    return item.atualizadoEm ||
        item.updatedAt ||
        item.criadoEm ||
        item.createdAt ||
        item.data ||
        "";

}

function toDashboardCardsDto(chamados, encaminhamentos) {

    return {
        chamadosAbertos: count(chamados, (item) => {
            return item.status === CALL_STATUS.OPEN;
        }),
        encaminhamentos: encaminhamentos.length,
        analise: count(encaminhamentos, (item) => {
            return item.status === EMAIL_STATUS.ANALYSIS;
        }),
        aguardando: count(encaminhamentos, (item) => {
            return item.status === EMAIL_STATUS.WAITING;
        }),
        respondidos: count(encaminhamentos, (item) => {
            return item.status === EMAIL_STATUS.ANSWERED;
        }),
        sla: count(encaminhamentos, (item) => {
            return item.slaVencido === true;
        })
    };

}

function toEncaminhamentoDashboardDto(item) {

    const atualizadoEm = getUpdatedAt(item);

    return {
        id: item.id ?? "",
        status: item.status ?? "",
        chamado: item.chamado ?? item.chamadoId ?? item.numeroChamado ?? "",
        titulo: item.titulo ?? item.assunto ?? "",
        analista: item.analistaNome ?? item.analista ?? "",
        equipe: item.equipeNome ?? item.equipe ?? "",
        atualizadoEm,
        dias: item.dias ?? calculateDays(atualizadoEm),
        slaVencido: item.slaVencido === true
    };

}

export async function getDashboardData() {

    const [
        chamadosResponse,
        encaminhamentosResponse
    ] = await Promise.all([
        list(DB_PATHS.CALLS),
        list(DB_PATHS.EMAILS)
    ]);

    const chamados = getItems(chamadosResponse);
    const encaminhamentos = getItems(encaminhamentosResponse);

    return createServiceResponse(
        chamadosResponse.success && encaminhamentosResponse.success,
        {
            cards: toDashboardCardsDto(chamados, encaminhamentos),
            ultimosEncaminhamentos: sortByRecent(
                encaminhamentos,
                DATE_FIELDS
            )
                .slice(0, 10)
                .map(toEncaminhamentoDashboardDto)
        },
        "",
        chamadosResponse.error || encaminhamentosResponse.error
    );

}

export async function getDashboardSummary() {

    return await getDashboardData();

}

export async function getLatestEncaminhamentos(limit = 10) {

    const response = await list(DB_PATHS.EMAILS);

    if (!response.success) {

        return response;

    }

    return {
        ...response,
        data: sortByRecent(response.data, DATE_FIELDS)
            .slice(0, limit)
            .map(toEncaminhamentoDashboardDto)
    };

}

export default {
    getDashboardData,
    getDashboardSummary,
    getLatestEncaminhamentos
};
