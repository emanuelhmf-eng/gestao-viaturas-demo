// ======================================
// AUTH.JS — FROTA DEMO 2.1
// LOGIN FIREBASE LIMPO
// ======================================

import {

    auth,
    db

}
from "../firebase.js";

import {

    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut

}
from
"../demo/auth.mjs";

import {

    doc,
    getDoc

}
from
"../demo/store.mjs";


// ======================================
// LOGIN
// ======================================

function aplicarEstadoAuth(user) {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );

    const app =
        document.getElementById(
            "app"
        );

    const usuarioLogado =
        document.getElementById(
            "usuarioLogado"
        );

    if (!user) {

        window.__demoAuthState = null;

        if (loginScreen) {
            loginScreen.style.display = "flex";
        }

        if (app) {
            app.classList.add("hidden");
            app.style.display = "none";
        }

        document.dispatchEvent(
            new CustomEvent(
                "demo-auth-state-changed",
                {
                    detail: { user: null }
                }
            )
        );

        return;
    }

    window.__demoAuthState = user;

    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    if (app) {
        app.classList.remove("hidden");
        app.style.display = "flex";
    }

    const menuCadastro =
        document.getElementById(
            "menuCadastro"
        );

    const adminEmail =
        "visitante@example.com";

    if (menuCadastro) {
        menuCadastro.style.display =
            user.email === adminEmail
                ? "flex"
                : "none";
    }

    if (usuarioLogado) {
        usuarioLogado.innerText =
            user.email || "Operacional";
    }

    document.dispatchEvent(
        new CustomEvent(
            "demo-auth-state-changed",
            {
                detail: { user }
            }
        )
    );
}

window.login =
async function () {

    const email = "visitante@example.com";
    const senha = "demo";

    try {

        await signInWithEmailAndPassword(

            auth,
            email,
            senha

        );

    }

    catch (erro) {

        console.error(
            erro
        );

        alert(
            "E-mail ou senha inválidos."
        );
    }
};


// ======================================
// VERIFICA LOGIN
// ======================================

let authListenerRegistrado = false;

async function atualizarPerfilUsuario(user) {

    if (!user) {
        return;
    }

    const usuarioLogado =
        document.getElementById(
            "usuarioLogado"
        );

    try {

        const userRef =
            doc(
                db,
                "usuarios",
                user.uid
            );

        const userSnap =
            await getDoc(
                userRef
            );

        let nome =
            user.email;

        let perfil =
            "OPERACIONAL";

        if (
            userSnap.exists()
        ) {

            const dados =
                userSnap.data();

            nome =
                dados.nome
                || user.email;

            perfil =
                dados.perfil
                || "OPERACIONAL";
        }

        if (
            usuarioLogado
        ) {

            usuarioLogado.innerHTML =
            `
            <strong>
                ${nome}
            </strong>
            <br>
            <small>
                ${perfil}
            </small>
            `;
        }

    }

    catch (erro) {

        console.error(
            erro
        );
    }
}

if (!authListenerRegistrado) {

    authListenerRegistrado = true;

    onAuthStateChanged(

        auth,

        async (user) => {

            console.log(
                user
                    ? `Usuário logado: ${user.email}`
                    : "Usuário não autenticado"
            );

            aplicarEstadoAuth(user);

            await atualizarPerfilUsuario(user);
        }
    );
}


// ======================================
// LOGOUT
// ======================================

window.logout =
async function () {

    const sair =
        confirm(
            "Deseja sair do sistema?"
        );

    if (!sair)
        return;

    try {

        await signOut(
            auth
        );

        alert(
            "Logout realizado."
        );

    }

    catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao sair."
        );
    }
};