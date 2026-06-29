/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/core/logQueue.js
 * Responsabilidade:
 * Fila de gravacao de logs.
 * ==========================================================
 */

import { persistLog } from "../services/logsService.js";

const queue = [];

export async function enqueueLog(logData) {

    queue.push(logData);

    const item = queue.shift();

    return await persistLog(item);

}

export function getLogQueue() {

    return [...queue];

}

export function clearLogQueue() {

    queue.length = 0;

}

export default {
    enqueueLog,
    getLogQueue,
    clearLogQueue
};

