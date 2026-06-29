/**
 * ==========================================================
 * SPS v2
 * Arquivo: users.js
 * Responsabilidade:
 * Controlar a interface da tela de usuários.
 * ==========================================================
 */

import {
    findAllUsers,
    createNewUser,
    saveUser
} from "../core/usersController.js";

import {
    logout
} from "../firebase/auth.js";

const tableBody = document.getElementById("usersTableBody");

const formCard = document.getElementById("userFormCard");
const form = document.getElementById("userForm");

const formTitle = document.getElementById("formTitle");

const txtUid = document.getElementById("uid");
const txtNome = document.getElementById("nome");
const txtEmail = document.getElementById("email");
const cmbPerfil = document.getElementById("perfil");
const chkAtivo = document.getElementById("ativo");

const txtPesquisa = document.getElementById("searchUser");

const btnNovo = document.getElementById("btnNovoUsuario");
const btnCancelar = document.getElementById("btnCancelar");
const btnLogout = document.getElementById("btnLogout");

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {

    registerEvents();

    hideForm();

    await loadUsers();

}

function registerEvents() {

    btnNovo.addEventListener("click", openNewUser);

    btnCancelar.addEventListener("click", hideForm);

    btnLogout.addEventListener("click", handleLogout);

    txtPesquisa.addEventListener("input", filterUsers);

    form.addEventListener("submit", submitForm);

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
                <button
                    class="btn-edit"
                    data-id="${user.id}">
                    Editar
                </button>
            </td>
        `;

        tr.querySelector(".btn-edit")
            .addEventListener("click", () => editUser(user));

        tableBody.appendChild(tr);

    });

}

function openNewUser() {

    form.reset();

    txtUid.value = "";

    chkAtivo.checked = true;

    cmbPerfil.value = "ANALISTA";

    formTitle.textContent = "Novo Usuário";

    formCard.hidden = false;

}

function editUser(user) {

    txtUid.value = user.id;

    txtNome.value = user.nome;

    txtEmail.value = user.email;

    cmbPerfil.value = user.perfil;

    chkAtivo.checked = user.ativo;

    formTitle.textContent = "Editar Usuário";

    formCard.hidden = false;

}

function hideForm() {

    formCard.hidden = true;

}

async function submitForm(event) {

    event.preventDefault();

    const data = {

        nome: txtNome.value.trim(),

        email: txtEmail.value.trim(),

        perfil: cmbPerfil.value,

        ativo: chkAtivo.checked

    };

    let result;

    if (txtUid.value === "") {

        result = await createNewUser(
            crypto.randomUUID(),
            data
        );

    } else {

        result = await saveUser(
            txtUid.value,
            data
        );

    }

    if (!result.success) {

        alert(result.message);

        return;

    }

    hideForm();

    await loadUsers();

}

function filterUsers() {

    const filter = txtPesquisa.value
        .trim()
        .toLowerCase();

    const rows = tableBody.querySelectorAll("tr");

    rows.forEach(row => {

        row.style.display =
            row.textContent
            .toLowerCase()
            .includes(filter) ?
            "" :
            "none";

    });

}

function formatDate(timestamp) {

    if (!timestamp) {

        return "-";

    }

    return new Date(timestamp)
        .toLocaleString("pt-BR");

}

async function handleLogout() {

    await logout();

    window.location.href = "login.html";

}