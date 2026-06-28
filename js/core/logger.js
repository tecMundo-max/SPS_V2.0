/**
 * ==========================================================
 * SPS v2
 * Arquivo: logger.js
 * Responsabilidade:
 * Registrar logs do sistema no Firebase.
 * ==========================================================
 */

import { create } from "../firebase/database.js";
import { DB_PATHS, AUDIT_ACTIONS } from "../config/constants.js";
import { getCurrentUser } from "../firebase/auth.js";

/**
 * Data/Hora ISO
 */
function now() {
    return new Date().toISOString();
}

/**
 * Informações do navegador
 */
function browserInfo() {

    return {
        language: navigator.language,
        platform: navigator.platform,
        userAgent: navigator.userAgent
    };

}

/**
 * Usuário autenticado
 */
function currentUser() {

    const user = getCurrentUser();

    if (!user) {

        return {
            uid: null,
            email: null
        };

    }

    return {
        uid: user.uid,
        email: user.email
    };

}

/**
 * Log padrão
 */
export async function log({

    action,
    module,
    description = "",
    data = null,
    level = "INFO"

}) {

    try {

        const user = currentUser();

        const logData = {

            action,
            module,
            description,
            level,
            data,

            timestamp: now(),
            timestampUnix: Date.now(),

            page: window.location.pathname,

            user,

            browser: browserInfo()

        };

        return await create(DB_PATHS.LOGS, logData);

    } catch (error) {

        console.error("LOGGER ERROR:", error);

        return {
            success: false,
            message: "Erro ao registrar log."
        };

    }

}

/**
 * Login
 */
export async function logLogin() {

    return await log({

        action: AUDIT_ACTIONS.LOGIN,
        module: "AUTH",
        description: "Login realizado."

    });

}

/**
 * Logout
 */
export async function logLogout() {

    return await log({

        action: AUDIT_ACTIONS.LOGOUT,
        module: "AUTH",
        description: "Logout realizado."

    });

}

/**
 * Criação
 */
export async function logCreate(module, data) {

    return await log({

        action: AUDIT_ACTIONS.CREATE,
        module,
        description: "Registro criado.",
        data

    });

}

/**
 * Atualização
 */
export async function logUpdate(module, before, after) {

    return await log({

        action: AUDIT_ACTIONS.UPDATE,
        module,
        description: "Registro atualizado.",

        data: {

            before,
            after

        }

    });

}

/**
 * Exclusão
 */
export async function logDelete(module, data) {

    return await log({

        action: AUDIT_ACTIONS.DELETE,
        module,
        description: "Registro excluído.",
        data

    });

}

/**
 * Consulta
 */
export async function logView(module, data = null) {

    return await log({

        action: AUDIT_ACTIONS.VIEW,
        module,
        description: "Consulta realizada.",
        data

    });

}

/**
 * Exportação
 */
export async function logExport(module, data = null) {

    return await log({

        action: AUDIT_ACTIONS.EXPORT,
        module,
        description: "Exportação realizada.",
        data

    });

}

/**
 * Importação
 */
export async function logImport(module, data = null) {

    return await log({

        action: AUDIT_ACTIONS.IMPORT,
        module,
        description: "Importação realizada.",
        data

    });

}

/**
 * Erros
 */
export async function logError(module, error) {

    return await log({

        action: "ERROR",

        module,

        level: "ERROR",

        description: error.message || "Erro inesperado.",

        data: {

            stack: error.stack || null,
            code: error.code || null

        }

    });

}

/**
 * Avisos
 */
export async function logWarning(module, message, data = null) {

    return await log({

        action: "WARNING",

        module,

        level: "WARNING",

        description: message,

        data

    });

}

/**
 * Informação
 */
export async function logInfo(module, message, data = null) {

    return await log({

        action: "INFO",

        module,

        level: "INFO",

        description: message,

        data

    });

}
