/**
 * ==========================================================
 * SPS v2
 * Arquivo: users.js
 * Responsabilidade:
 * Controlar a interface da página de usuários.
 * ==========================================================
 */

import {
    findAllUsers
} from "../core/usersController.js";

import {
    logout
} from "../firebase/auth.js";

const tableBody = document.getElementById("usersTableBody");
const btnLogout = document.getElementById("btnLogout");
const btnNovoUsuario = document.getElementById("btnNovoUsuario");

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
    registerEvents();
    await loadUsers();
}

function registerEvents() {
    if (btnLogout) {
        btnLogout.addEventListener("click", handleLogout);
    }

    if (btnNovoUsuario) {
        btnNovoUsuario.addEventListener("click", handleNewUser);
    }
}

async function loadUsers() {

    tableBody.innerHTML = `
        <tr>
            <td colspan="6">Carregando...</td>
        </tr>
    `;

    const result = await findAllUsers();

    if (!result.success) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">${result.message}</td>
            </tr>
        `;

        return;
    }

    renderUsers(result.data);
}

function renderUsers(users) {

    if (!users.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">Nenhum usuário encontrado.</td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = "";

    users.forEach(user => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td>${user.perfil}</td>
            <td>${user.ativo ? "Ativo" : "Inativo"}</td>
            <td>${formatDate(user.ultimoLogin)}</td>
            <td>
                <button data-id="${user.id}" class="btn-edit">
                    Editar
                </button>
            </td>
        `;

        tableBody.appendChild(tr);

    });

}

function formatDate(timestamp) {

    if (!timestamp) {
        return "-";
    }

    return new Date(timestamp).toLocaleString("pt-BR");

}

async function handleLogout() {

    await logout();

    window.location.href = "login.html";

}

function handleNewUser() {

    alert("Cadastro de usuário será implementado na próxima etapa.");

}