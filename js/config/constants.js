/**
 * ==========================================================
 * SPS v2
 * Arquivo: constants.js
 * Responsabilidade:
 * Centralizar constantes utilizadas em todo o sistema.
 * ==========================================================
 */

/* ==========================================================
   PERFIS DE USUÁRIO
========================================================== */

export const USER_PROFILES = Object.freeze({

    SUPERVISOR: "SUPERVISOR",
    ANALISTA: "ANALISTA"

});

/* ==========================================================
   STATUS DOS ENCAMINHAMENTOS
========================================================== */

export const EMAIL_STATUS = Object.freeze({

    OPEN: "Em Aberto",
    ANALYSIS: "Em Análise",
    WAITING: "Aguardando Retorno",
    ANSWERED: "Respondido",
    CLOSED: "Encerrado",
    CANCELED: "Cancelado"

});

/* ==========================================================
   PRIORIDADES
========================================================== */

export const PRIORITIES = Object.freeze({

    LOW: "Baixa",
    MEDIUM: "Média",
    HIGH: "Alta",
    CRITICAL: "Crítica"

});

/* ==========================================================
   STATUS DOS CHAMADOS
========================================================== */

export const CALL_STATUS = Object.freeze({

    OPEN: "Aberto",
    IN_PROGRESS: "Em Atendimento",
    PENDING: "Pendente",
    CLOSED: "Encerrado",
    CANCELED: "Cancelado"

});

/* ==========================================================
   NÓS DO FIREBASE
========================================================== */

export const DB_PATHS = Object.freeze({

    USERS: "users",
    ENCAMINHAMENTOS: "encaminhamentos",
    FECHAMENTOS: "fechamentos",
    CONFIGURACOES: "configuracoes",
    LOGS: "logs",
    DASHBOARD: "dashboard",
    METADATA: "metadata"

});

/* ==========================================================
   AÇÕES DE AUDITORIA
========================================================== */

export const AUDIT_ACTIONS = Object.freeze({

    CREATE: "CREATE",
    UPDATE: "UPDATE",
    DELETE: "DELETE",

    LOGIN: "LOGIN",
    LOGOUT: "LOGOUT",

    PASSWORD_RESET: "PASSWORD_RESET",

    PROFILE_CHANGE: "PROFILE_CHANGE",

    ACTIVATE: "ACTIVATE",
    DEACTIVATE: "DEACTIVATE",

    EXPORT: "EXPORT",
    IMPORT: "IMPORT",

    VIEW: "VIEW"

});

/* ==========================================================
   TIPOS DE MENSAGEM
========================================================== */

export const MESSAGE_TYPES = Object.freeze({

    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info"

});

/* ==========================================================
   CONFIGURAÇÕES GERAIS
========================================================== */

export const APP_CONFIG = Object.freeze({

    NAME: "SPS v2",

    VERSION: "0.2.0",

    DEFAULT_PAGE_SIZE: 25,

    DATE_FORMAT: "pt-BR",

    DATETIME_FORMAT: "pt-BR",

    AUTO_REFRESH_SECONDS: 60

});