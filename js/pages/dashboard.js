/*
< !DOCTYPE html >
    <
    html lang = "pt-BR" >

    <
    head >

    <
    meta charset = "UTF-8" >

    <
    meta
name = "viewport"
content = "width=device-width, initial-scale=1.0" >

    <
    title > SPS v2 | Dashboard < /title>

<
link rel = "stylesheet"
href = "css/reset.css" >
    <
    link rel = "stylesheet"
href = "css/variables.css" >
    <
    link rel = "stylesheet"
href = "css/layout.css" >
    <
    link rel = "stylesheet"
href = "css/components.css" >
    <
    link rel = "stylesheet"
href = "css/forms.css" >
    <
    link rel = "stylesheet"
href = "css/tables.css" >

    <
    /head>

<
body >

    <!-- NAVBAR -->
    <
    header id = "navbar"
class = "topbar" >

    <
    div class = "logo" >

    SPS v2

    <
    /div>

<
nav class = "menu" >

    <
    a href = "dashboard.html"
class = "active" >
    Dashboard <
    /a>

<
a href = "chamados.html" >
    Chamados <
    /a>

<
a href = "encaminhamentos.html" >
    Encaminhamentos <
    /a>

<
a href = "relatorios.html" >
    Relatórios <
    /a>

<
a href = "usuarios.html" >
    Usuários <
    /a>

<
a href = "configuracoes.html" >
    Configurações <
    /a>

<
/nav>

<
div class = "user-area" >

    <
    span id = "userName" > < /span>

<
button
id = "btnLogout"
class = "btn btn-danger" >

    Sair

    <
    /button>

<
/div>

<
/header>

<!-- CONTEÚDO -->

<
main class = "dashboard" >

    <!-- CARDS -->

    <
    section class = "cards" >

    <
    article class = "card" >

    <
    h3 > Chamados < /h3>

<
span id = "cardChamadosAbertos" > 0 < /span>

<
/article>

<
article class = "card" >

    <
    h3 > Encaminhamentos < /h3>

<
span id = "cardEncaminhamentos" > 0 < /span>

<
/article>

<
article class = "card" >

    <
    h3 > Em análise < /h3>

<
span id = "cardAnalise" > 0 < /span>

<
/article>

<
article class = "card" >

    <
    h3 > Aguardando < /h3>

<
span id = "cardAguardando" > 0 < /span>

<
/article>

<
article class = "card" >

    <
    h3 > Respondidos < /h3>

<
span id = "cardRespondidos" > 0 < /span>

<
/article>

<
article class = "card" >

    <
    h3 > SLA vencido < /h3>

<
span id = "cardSla" > 0 < /span>

<
/article>

<
/section>

<!-- TABELA -->

<
section class = "panel" >

    <
    div class = "panel-header" >

    <
    h2 >

    Últimos Encaminhamentos

    <
    /h2>

<
button
id = "btnAtualizar"
class = "btn btn-primary" >

    Atualizar

    <
    /button>

<
/div>

<
div class = "table-responsive" >

    <
    table class = "table" >

    <
    thead >

    <
    tr >

    <
    th > Status < /th>

<
th > Chamado < /th>

<
th > Título < /th>

<
th > Analista < /th>

<
th > Equipe < /th>

<
th > Atualização < /th>

<
th > Dias < /th>

<
th > Ações < /th>

<
/tr>

<
/thead>

<
tbody id = "dashboardTable" >

    <
    /tbody>

<
/table>

<
/div>

<
/section>

<
/main>

<!-- TOAST -->

<
div id = "toastContainer" > < /div>

<!-- MODAIS -->

<
div id = "modalContainer" > < /div>

<!-- LOADING -->

<
div
id = "loading"
class = "loading hidden" >

    Carregando...

<
/div>

<
footer class = "footer" >

    <
    span >

    SPS v2

    <
    /span>

<
span >

    Versão 2.0

    <
    /span>

<
/footer>

<
script
type = "module"
src = "js/pages/dashboard.js" >

    <
    /script>

<
/body>

<
/html>
*/

import { getProfile } from "../core/appContext.js";
import { logoutUser } from "../core/authController.js";
import { getDashboardViewData } from "../core/dashboardController.js";
import { logError, logLogout } from "../core/logger.js";
import { navigateToLogin } from "../router.js";

let initialized = false;

function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {

        element.textContent = value ?? "";

    }

}

function renderUser() {

    const profile = getProfile();

    setText("userName", profile?.nome || profile?.email || "");

}

function renderCards(cards = {}) {

    setText("cardChamadosAbertos", cards.chamadosAbertos ?? 0);
    setText("cardEncaminhamentos", cards.encaminhamentos ?? 0);
    setText("cardAnalise", cards.analise ?? 0);
    setText("cardAguardando", cards.aguardando ?? 0);
    setText("cardRespondidos", cards.respondidos ?? 0);
    setText("cardSla", cards.sla ?? 0);

}

function createCell(value) {

    const cell = document.createElement("td");
    cell.textContent = value ?? "";

    return cell;

}

function renderTable(items = []) {

    const table = document.getElementById("dashboardTable");

    if (!table) {

        return;

    }

    table.textContent = "";

    items.forEach((item) => {

        const row = document.createElement("tr");

        row.appendChild(createCell(item.status));
        row.appendChild(createCell(item.chamado));
        row.appendChild(createCell(item.titulo));
        row.appendChild(createCell(item.analista));
        row.appendChild(createCell(item.equipe));
        row.appendChild(createCell(item.atualizadoEm));
        row.appendChild(createCell(item.dias));
        row.appendChild(createCell(""));

        table.appendChild(row);

    });

}

async function loadDashboard() {

    const response = await getDashboardViewData();

    if (!response.success) {

        return;

    }

    renderCards(response.data.cards);
    renderTable(response.data.ultimosEncaminhamentos);

}

async function handleLogout() {

    try {

        await logLogout();
        await logoutUser();
        navigateToLogin();

    } catch (error) {

        await logError("DASHBOARD", error);

    }

}

export async function initializePage() {

    if (initialized) {

        return;

    }

    initialized = true;

    renderUser();

    const logoutButton = document.getElementById("btnLogout");
    const refreshButton = document.getElementById("btnAtualizar");

    if (logoutButton) {

        logoutButton.addEventListener("click", handleLogout);

    }

    if (refreshButton) {

        refreshButton.addEventListener("click", () => {

            loadDashboard().catch((error) => {

                logError("DASHBOARD", error);

            });

        });

    }

    await loadDashboard();

}
