import { loginUser, recoverPassword } from "../core/authController.js";
import { logLogin, logError } from "../core/logger.js";
import { navigateToDefaultAuthenticatedPage } from "../router.js";

const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const btnForgotPassword = document.getElementById("btnForgotPassword");
const loading = document.getElementById("loading");
const message = document.getElementById("loginMessage");

function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = `login-message ${type}`;
}

function clearMessage() {
    message.textContent = "";
    message.className = "login-message";
}

function setLoading(status) {
    loading.classList.toggle("hidden", !status);
    btnLogin.disabled = status;
    email.disabled = status;
    password.disabled = status;
}

form.addEventListener("submit", async(event) => {
    event.preventDefault();
    clearMessage();

    const userEmail = email.value.trim();
    const userPassword = password.value;

    if (!userEmail) {
        showMessage("Informe o e-mail.");
        email.focus();
        return;
    }

    if (!userPassword) {
        showMessage("Informe a senha.");
        password.focus();
        return;
    }

    setLoading(true);

    try {
        const response = await loginUser(userEmail, userPassword);

        if (!response.success) {
            showMessage(response.message);
            setLoading(false);
            return;
        }
logLogin()
.catch(console.error);

navigateToDefaultAuthenticatedPage();

    } catch (error) {

        await logError("LOGIN", error);

        showMessage("Erro inesperado.");

    } finally {

        setLoading(false);

    }

});

btnForgotPassword.addEventListener("click", async() => {

    clearMessage();

    const userEmail = email.value.trim();

    if (!userEmail) {
        showMessage("Informe seu e-mail para recuperar a senha.");
        email.focus();
        return;
    }

    const response = await recoverPassword(userEmail);

    if (response.success) {
        showMessage(response.message, "success");
    } else {
        showMessage(response.message);
    }

});

window.addEventListener("load", () => {
    email.focus();
});
