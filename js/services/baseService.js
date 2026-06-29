/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/services/baseService.js
 * Responsabilidade:
 * Helpers reutilizaveis da camada de Services.
 * ==========================================================
 */

export function createServiceResponse(
    success,
    data = null,
    message = "",
    error = null
) {

    return {
        success,
        data,
        message,
        error
    };

}

export function successResponse(data = null, message = "") {

    return createServiceResponse(
        true,
        data,
        message
    );

}

export function errorResponse(message = "Erro inesperado.", error = null, data = null) {

    return createServiceResponse(
        false,
        data,
        message,
        normalizeError(error)
    );

}

export function handleError(error, message = "Erro inesperado.", data = null) {

    return errorResponse(
        message,
        error,
        data
    );

}

export async function execute(action, errorMessage = "Erro inesperado.") {

    try {

        return await action();

    } catch (error) {

        return handleError(
            error,
            errorMessage
        );

    }

}

export async function executeTransaction(action, errorMessage = "Erro na transacao.") {

    return await execute(
        action,
        errorMessage
    );

}

export function normalizeError(error) {

    if (!error) {

        return null;

    }

    if (typeof error === "string") {

        return error;

    }

    return error.message || "Erro inesperado.";

}

export function timestamp() {

    return new Date().toISOString();

}

export function createTimestamp() {

    return timestamp();

}

export function timestampUnix() {

    return Date.now();

}

export function isBlank(value) {

    return value === null ||
        value === undefined ||
        value === "";

}

export function requireValue(value, fieldName) {

    if (!isBlank(value)) {

        return null;

    }

    return errorResponse(`${fieldName} obrigatorio.`);

}

export function validateRequired(data = {}, fields = []) {

    const source = data || {};

    for (const field of fields) {

        if (isBlank(source[field])) {

            return errorResponse(`${field} obrigatorio.`);

        }

    }

    return null;

}

export function cleanObject(data = {}) {

    const result = {};

    Object.entries(data).forEach(([key, value]) => {

        if (value !== undefined) {

            result[key] = value;

        }

    });

    return result;

}

export function normalize(data = {}, defaults = {}) {

    return cleanObject({
        ...defaults,
        ...data
    });

}

export function createAuditData(userUid = null, data = {}) {

    const now = createTimestamp();

    return cleanObject({
        criadoEm: data.criadoEm || now,
        atualizadoEm: data.atualizadoEm || now,
        criadoPor: data.criadoPor || userUid,
        atualizadoPor: data.atualizadoPor || userUid
    });

}

export function applyFilters(items = [], filters = {}) {

    const activeFilters = Object.entries(filters).filter(([, value]) => {

        return !isBlank(value);

    });

    if (!activeFilters.length) {

        return items;

    }

    return items.filter((item) => {

        return activeFilters.every(([field, value]) => {

            if (Array.isArray(value)) {

                return value.includes(item[field]);

            }

            return item[field] === value;

        });

    });

}

export function getDateValue(item, fields = []) {

    for (const field of fields) {

        if (item && item[field]) {

            return new Date(item[field]).getTime() || 0;

        }

    }

    return 0;

}

export function sortByRecent(items = [], fields = []) {

    return [...items].sort((current, next) => {

        return getDateValue(next, fields) - getDateValue(current, fields);

    });

}
