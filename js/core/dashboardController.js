/**
 * ==========================================================
 * SPS v2
 * Arquivo: js/core/dashboardController.js
 * Responsabilidade:
 * Fachada de dados do Dashboard para a camada Pages.
 * ==========================================================
 */

import { getDashboardData } from "../services/dashboardService.js";

export async function getDashboardViewData() {

    return await getDashboardData();

}

export default {
    getDashboardViewData
};

