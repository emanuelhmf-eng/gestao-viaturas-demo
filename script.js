// ========================================
// FROTA DEMO 2.5 — CORE OTIMIZADO
// ========================================

import { db, auth, storage } from "./firebase.js";

import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
}
from
"./demo/store.mjs";

import {
    ref,
    uploadBytes,
    getDownloadURL
}
from
"./demo/store.mjs";


// ======================================
// CACHE GLOBAL
// ======================================

const cache = {

    viaturas: [],
    motoristas: [],
    historico: [],
    operacoes: [],
    checklist: [],
    checklists: []
};


window.carregarSelectAvaria =
function(){

    const select =
        document.getElementById(
            "avariaViatura"
        );

    if(!select) return;

    select.innerHTML =
        `<option value="">
            Selecione
        </option>`;

    cache.viaturas.forEach(v => {

        select.innerHTML += `

            <option value="${v.id}">
                ${v.nome}
                - ${v.placa}
            </option>

        `;

    });

};

document.addEventListener(
    "change",
    async (e) => {

        if(
            e.target.id !==
            "avariaViatura"
        ){
            return;
        }

        const viaturaId =
            e.target.value;

        const viatura =
            cache.viaturas.find(
                v => v.id === viaturaId
            );

        if(!viatura) return;

        document.getElementById(
            "avariaPlaca"
        ).value =
            viatura.placa || "";

        document.getElementById(
            "avariaModelo"
        ).value =
            viatura.modelo || "";

        document.getElementById(
            "avariaKm"
        ).value =
            viatura.kmAtual || 0;

        const empresa =
            document.getElementById(
                "empresaLocacao"
            );

        if(empresa){

            empresa.value =
                "FROTA DEMO";

        }

    }
);

// ========================================
// LISTENERS GLOBAIS
// ========================================

let listeners = [];

let appInicializado = false;
let authEventListenerRegistrado = false;



// ========================================
// INICIALIZAÇÃO CENTRAL
// ========================================

function iniciarSistema(){

    carregarData();

    configurarMenuMobile();

    iniciarAuth();

    console.log(
        "FROTA DEMO iniciado com sucesso"
    );

}

// ========================================
// START APP
// ========================================

document.addEventListener(

    "DOMContentLoaded",

    iniciarSistema

);



// ========================================
// DATA ATUAL
// ========================================

function carregarData() {

    const dataAtual =
        document.getElementById("dataAtual");

    if (!dataAtual) return;

    const hoje = new Date();

    const dataFormatada =
        hoje.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    dataAtual.innerText =
        dataFormatada;
}


// ========================================
// MENU MOBILE
// ========================================

function configurarMenuMobile() {

    const sidebar =
        document.getElementById("sidebar");

    if (!sidebar) return;

    window.toggleMenu = () => {

        sidebar.classList.toggle("open");

    };
}

//==========TROCAR TELA====================
// ========================================



// ========================================
// LIMPAR LISTENERS
// ========================================

function limparListeners(){

    listeners.forEach((unsub) => {
        if (typeof unsub === "function") {
            unsub();
        }
    });

    listeners = [];

}

// ========================================
// ADICIONAR LISTENER
// ========================================

function adicionarListener(unsubscribe){

    if (typeof unsubscribe === "function") {
        listeners.push(unsubscribe);
    }

}

// ========================================
// HELPERS
// ========================================

function elemento(id){
    return document.getElementById(id);
}

function logErro(origem, erro){
    console.error(`[${origem}]`, erro);
}

async function removerDocumento(collectionName, id, mensagemSucesso, mensagemErro) {
    try {
        await deleteDoc(doc(db, collectionName, id));
        alert(mensagemSucesso);
    } catch (error) {
        console.error(error);
        alert(mensagemErro);
    }
}

async function atualizarDocumento(collectionName, id, dados, mensagemSucesso, mensagemErro) {
    try {
        await updateDoc(doc(db, collectionName, id), dados);
        alert(mensagemSucesso);
    } catch (error) {
        console.error(error);
        alert(mensagemErro);
    }
}


// ========================================
// TROCAR TELAS
// ========================================

window.mostrarTela = function(
    idTela,
    botao = null
){



    try{

        // ====================================
        // ESCONDER TELAS
        // ====================================

        document
            .querySelectorAll(".tela")
            .forEach(tela => {

                tela.style.display = "none";

                tela.classList.remove("active");

            });

        // ====================================
        // MOSTRAR TELA
        // ====================================

        const telaAtual =
            document.getElementById(idTela);

        if(telaAtual){

            telaAtual.style.display = "block";

            telaAtual.classList.add("active");

        }


        if (
            idTela ===
            "fichaAvaria"
        ){

            carregarSelectAvaria();

            setTimeout(() => {

                iniciarCroqui();

            }, 300);

}

        // ====================================
        // MENU ACTIVE
        // ====================================

        document
            .querySelectorAll(
                ".menu button, .sidebar button, .sidebar li"
            )
            .forEach(item => {

                item.classList.remove(
                    "menu-active"
                );

            });

        if(botao){

            botao.classList.add(
                "menu-active"
            );

        }

        // ====================================
        // FECHAR MENU MOBILE
        // ====================================

        const sidebar =
            document.getElementById(
                "sidebar"
            );

        if(sidebar){

            sidebar.classList.remove("open");

        }

    }

    catch(error){

        console.error(
            "Erro mostrarTela:",
            error
        );

    }

};


// ========================================
// ========================================

function limparEstadoAutenticacao(){

    limparListeners();

    const loginScreen =
        elemento("loginScreen");

    const app =
        elemento("app");

    if(loginScreen){

        loginScreen.style.display =
            "flex";

    }

    if(app){

        app.classList.add(
            "hidden"
        );

        app.style.display =
            "none";

    }

    appInicializado = false;

    dashboardInicializado = false;

    observacoesDashboardInicializadas =
        false;

    historicoInicializado = false;

    cache.checklists = [];

    cache.operacoes = [];

    cache.historico = [];

}

function inicializarAppAutenticado(user){

    const loginScreen =
        elemento("loginScreen");

    const app =
        elemento("app");

    const usuarioLogado =
        elemento("usuarioLogado");

    if(loginScreen){
        loginScreen.style.display = "none";
    }

    if(app){
        app.classList.remove("hidden");
        app.style.display = "flex";
    }

    if(usuarioLogado){
        usuarioLogado.innerText =
            user?.email || "Operacional";
    }

    const menuCadastro =
        document.getElementById(
            "menuCadastro"
        );

    const adminEmail =
        "visitante@example.com";

    if(menuCadastro){
        menuCadastro.style.display =
            user?.email === adminEmail
                ? "flex"
                : "none";
    }

    if (!appInicializado) {
        iniciarDashboard();
        iniciarDashboardInteligente();
        carregarHistorico();
        iniciarObservacoesDashboard();
        appInicializado = true;
    } else {
        atualizarDashboardComDadosAtuais();
    }

    mostrarTela("dashboard");

}

function tratarEstadoAuth(event){

    const user =
        event?.detail?.user ||
        window.__demoAuthState ||
        null;

    window.__demoAuthState = user;

    if(user){
        inicializarAppAutenticado(user);
        return;
    }

    limparEstadoAutenticacao();

}

function iniciarAuth(){

    if(authEventListenerRegistrado){
        tratarEstadoAuth({
            detail: { user: window.__demoAuthState }
        });
        return;
    }

    authEventListenerRegistrado = true;

    document.addEventListener(
        "demo-auth-state-changed",
        tratarEstadoAuth
    );

    tratarEstadoAuth({
        detail: { user: window.__demoAuthState }
    });

}


// ========================================

function contarViaturasPorStatus(viaturas) {

    const totais = {
        livres: 0,
        emUso: 0,
        manutencao: 0,
        baixadas: 0
    };

    viaturas.forEach((viatura) => {

        const status =
            normalizarStatusViatura(
                viatura?.status
            );

        switch (status) {

            case "LIVRE":
                totais.livres++;
                break;

            case "EM USO":
                totais.emUso++;
                break;

            case "MANUTENCAO":
                totais.manutencao++;
                break;

            case "BAIXADA":
                totais.baixadas++;
                break;

        }

    });

    return totais;

}

function atualizarDashboardComDadosAtuais() {

    if (!cache.viaturas?.length) {
        return;
    }

    atualizarIndicadoresDashboard(
        cache.viaturas,
        cache.checklists
    );

}

function iniciarDashboard(){

    const unsubscribe =

        onSnapshot(

            collection(db, "viaturas"),

            (snapshot) => {

                cache.viaturas =
                    snapshot.docs.map(doc => ({

                        id: doc.id,
                        ...doc.data()

                    }));

                atualizarIndicadoresDashboard(
                    cache.viaturas,
                    cache.checklists
                );

            },

            (erro) => {

                logErro(
                    "Dashboard",
                    erro
                );

            }

        );

    adicionarListener(unsubscribe);

}


// ========================================
// ATUALIZAR DASHBOARD
// ========================================


function atualizarDashboard(
    livres,
    emUso,
    manutencao,
    baixadas
){

    const valores = {
        totalLivres: livres,
        totalUso: emUso,
        totalManutencao: manutencao,
        totalBaixadas: baixadas
    };

    Object.entries(valores).forEach(([id, valor]) => {
        const elementoAtual = elemento(id);
        if (elementoAtual) {
            elementoAtual.innerText = valor;
        }
    });

}

function atualizarIndicadoresDashboard(viaturas = [], checklists = []) {

    const totais = contarViaturasPorStatus(viaturas);

    atualizarDashboard(
        totais.livres,
        totais.emUso,
        totais.manutencao,
        totais.baixadas
    );

    const hoje = new Date();
    let totalChecklistHoje = 0;

    checklists.forEach((item) => {

        const dados = item?.data ? item.data() : item;
        const dataChecklist = converterParaData(dados?.createdAt);

        if (!dataChecklist) {
            return;
        }

        const mesmoDia =
            dataChecklist.getFullYear() === hoje.getFullYear() &&
            dataChecklist.getMonth() === hoje.getMonth() &&
            dataChecklist.getDate() === hoje.getDate();

        if (mesmoDia) {
            totalChecklistHoje++;
        }

    });

    atualizarElemento("totalChecklistHoje", totalChecklistHoje);

}



// ========================================
// MODAIS
// ========================================

window.fecharModal =
function(modalId) {

    const modal =
        document.getElementById(
            modalId
        );

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

};


// ========================================
// ABRIR MODAIS
// ========================================

function abrirModalGenerico(modalId) {
    abrirModal(modalId);
}

window.abrirModalViatura = function() {
    abrirModalGenerico("modalViatura");
};

window.abrirModalMotorista = function() {
    abrirModalGenerico("modalMotorista");
};

window.abrirModalTeatro = function() {
    abrirModalGenerico("modalTeatro");
};

window.abrirModalChecklist = function() {
    abrirModalGenerico("modalChecklist");
};

window.abrirModalManutencao = function() {
    abrirModalGenerico("modalManutencao");
};


// ========================================
// FUNÇÃO PADRÃO ABRIR MODAL
// ========================================
function abrirModal(id){

    const modal = elemento(id);

    if(!modal) return;

    modal.classList.remove("hidden");

}
// ==========================================
// REFERÊNCIA FIREBASE
// ==========================================

const viaturasRef = collection(db, "viaturas");





// ==========================================
// SALVAR VIATURA
// ==========================================

window.salvarViatura = async () => {

    const nomeInput =
        document.getElementById("viaturaNome");

    const placaInput =
        document.getElementById("viaturaPlaca");

    if (!nomeInput || !placaInput) {

        alert("Campos da viatura não encontrados.");
        return;
    }

    const nome =
        nomeInput.value.trim();

    const placa =
        placaInput.value.trim().toUpperCase();

    if (!nome || !placa) {

        alert("Preencha todos os campos.");
        return;
    }

    try {

        const kmAtual =
            Number(
                document.getElementById(
                    "viaturaKmAtual"
                )?.value || 0
            );

        const kmTrocaOleo =
            Number(
                document.getElementById(
                    "viaturaKmTrocaOleo"
                )?.value || 0
            );

        await addDoc(viaturasRef, {

            nome,
            placa,

            status: "LIVRE",

            kmAtual,

            kmTrocaOleo,

            createdAt:
                serverTimestamp()

        });

        alert("Viatura cadastrada com sucesso.");

        nomeInput.value = "";
        placaInput.value = "";

        fecharModal("modalViatura");

    } catch (error) {

        console.error(
            "Erro ao salvar viatura:",
            error
        );

        alert(
            "Erro ao cadastrar viatura."
        );
    }
};


// ==========================================
// LISTAR VIATURAS EM TEMPO REAL
// ==========================================

onSnapshot(

    viaturasRef,

    (snapshot) => {
        // =====================================
        // ATUALIZA CACHE
        // =====================================

        atualizarStatusSistema("online");

        cache.viaturas = [];

        const listaViaturas =
            document.getElementById(
                "listaViaturas"
            );

        const dashboardCards =
            document.getElementById(
                "dashboardCards"
            );

        const listaConfig =
            document.getElementById(
                "listaConfigViaturas"
            );

        // limpa listas somente se existirem

        if (listaViaturas) {
            listaViaturas.innerHTML = "";
        }

        if (dashboardCards) {
            dashboardCards.innerHTML = "";
        }

        if (listaConfig) {
            listaConfig.innerHTML = "";
        }

        snapshot.forEach((docItem) => {

            const dados =
                docItem.data();

            const id =
                docItem.id;

            // =====================================
            // ADICIONA A VIATURA AO CACHE
            // =====================================

            cache.viaturas.push({

                id,

                ...dados

            });

            let alertaOleo = "";

                if (
                    dados.kmTrocaOleo &&
                    Number(dados.kmAtual) >= Number(dados.kmTrocaOleo)
                ){

                    alertaOleo = `

                        <div class="alerta-oleo">

                            <i class="fa-solid fa-oil-can"></i>

                            TROCA DE ÓLEO PENDENTE

                        </div>

                    `;

                }

            const statusNormalizado =
                normalizarStatusViatura(
                    dados.status
                );

            let statusClass =
                "status-livre";

            let cardClass =
                "card-livre";

            if(
                statusNormalizado ===
                "BAIXADA"
            ){

                statusClass =
                    "status-baixada";

                cardClass =
                    "card-baixada";

            }

            if (
                statusNormalizado ===
                "EM USO"
            ) {

                statusClass =
                    "status-uso";

                cardClass =
                    "card-uso";
            }

            if (
                statusNormalizado ===
                "MANUTENCAO"
            ) {

                statusClass =
                    "status-manutencao";

                cardClass =
                    "card-manutencao";
            }

            
            const cardViaturas = `

                <div class="viatura-card ${cardClass}">

                    <img
                        src="assets/demo-viatura.svg"
                        class="viatura-imagem"
                    >

                    <div class="viatura-content">

                        <h3>${dados.nome}</h3>

                        <p>
                            <strong>Placa:</strong>
                            ${dados.placa}
                        </p>

                        <p>
                            <strong>KM:</strong>
                            ${dados.kmAtual || 0}
                        </p>

                        <p>
                            <strong>
                            Troca óleo:
                            </strong>
                           ${
                                dados.kmTrocaOleo ||
                                "Não informado"
                            } km
                        </p>
                        ${alertaOleo}

                        <span class="
                            status-badge
                            ${statusClass}
                        ">
                            ${dados.status}
                        </span>

                        <div class="card-actions">

                            <button
                                class="btn-details"
                                onclick="abrirChecklist('${id}')">

                                <i class="fa-solid fa-clipboard-check"></i>

                                Checklist

                            </button>

                            <button
                                class="btn-uso"
                                onclick="abrirEntradaOperacao('${id}')">

                                <i class="fa-solid fa-car-side"></i>

                                Em Uso

                            </button>

                            <button
                                class="btn-livre"
                                onclick="alterarStatusViatura('${id}','LIVRE')">

                                <i class="fa-solid fa-circle-check"></i>

                                Livre

                            </button>

                            <button
                                class="btn-baixa"
                                onclick="baixarViatura('${id}')">

                                <i class="fa-solid fa-ban"></i>

                                Baixar

                            </button>

                            <button
                                class="btn-delete"
                                onclick="removerViatura('${id}')">

                                <i class="fa-solid fa-trash"></i>

                                Remover

                            </button>

                        </div>

                    </div>

                </div>
            `;

            // MENU VIATURAS
            if (listaViaturas) {
                listaViaturas.innerHTML += cardViaturas;
            }

            // DASHBOARD
            if (dashboardCards) {

                dashboardCards.innerHTML += `
                    <div class="viatura-card ${cardClass}">

                        <img
                            src="assets/demo-viatura.svg"
                            class="viatura-imagem"
                        >

                        <div class="viatura-content">

                            <h3>${dados.nome}</h3>

                            <p>
                                Placa:
                                ${dados.placa}
                            </p>

                            <p>
                                KM:
                                ${dados.kmAtual || 0}
                            </p>

                            ${alertaOleo}

                            <span class="
                                status-badge
                                ${statusClass}
                            ">
                                ${dados.status}
                            </span>

                            ${
                                dados.status === "BAIXADA"

                                ?

                                `<button
                                    class="btn-detalhe-baixa"
                                    onclick="
                                        detalhesBaixa('${id}')
                                    "
                                >

                                    <i class="fas fa-file-alt"></i>

                                    Detalhe da Baixa

                                </button>`

                                :

                                ""
                            }

                        </div>

                    </div>
                `;
            }

            // MENU CADASTRO
            if (listaConfig) {

               listaConfig.innerHTML += `

                <div class="viatura-card">

                    <img
                        src="assets/demo-viatura.svg"
                        class="viatura-imagem"
                    >

                    <div class="viatura-content">

                        <h3>
                            ${dados.nome}
                        </h3>

                        <p class="viatura-info">

                            <strong>Placa:</strong>
                            ${dados.placa}

                        </p>

                        <p class="viatura-info">

                            <strong>KM:</strong>
                            ${dados.kmAtual || 0}

                        </p>

                        <span class="
                            status-badge
                            ${statusClass}
                        ">
                            ${dados.status}
                        </span>

                        <div class="card-actions">

                            <button
                                class="btn-edit"
                                onclick="
                                    editarViatura(
                                        '${id}'
                                    )
                                "
                            >

                                Editar

                            </button>

                            <button
                                class="btn-delete"
                                onclick="
                                    removerViatura(
                                        '${id}'
                                    )
                                "
                            >

                                Remover

                            </button>

                        </div>

                    </div>

                </div>

            `;
            }

        });

        atualizarIndicadoresDashboard(
            cache.viaturas,
            cache.checklists
        );

    },

    (erro) => {

        console.error(
            "Erro no snapshot:",
            erro
        );

    }

);


// ==========================================
// REMOVER VIATURA
// ==========================================

window.removerViatura =
async (id) => {

    const confirmar =
        confirm(
            "Deseja remover esta viatura?"
        );

    if (!confirmar) return;

    await removerDocumento(
        "viaturas",
        id,
        "Viatura removida.",
        "Erro ao remover viatura."
    );
};

// ==========================================
// EDITAR VIATURA
// ==========================================

window.editarViatura =
async (id) => {

    try {

        const viaturaRef =
            doc(
                db,
                "viaturas",
                id
            );

        const viaturaSnap =
            await getDoc(
                viaturaRef
            );

        if (
            !viaturaSnap.exists()
        ) {

            alert(
                "Viatura não encontrada."
            );

            return;
        }

        const dados =
            viaturaSnap.data();

        // ======================
        // NOVOS DADOS
        // ======================

        const novoNome =
            prompt(
                "Nome da viatura:",
                dados.nome
            );

        if (!novoNome)
            return;

        const novaPlaca =
            prompt(
                "Placa:",
                dados.placa
            );

        if (!novaPlaca)
            return;

        const novoKm =
            prompt(
                "KM Atual:",
                dados.kmAtual || 0
            );

        // ======================
        // UPDATE FIREBASE
        // ======================

        await atualizarDocumento(
            "viaturas",
            id,
            {
                nome: novoNome.trim(),
                placa: novaPlaca.trim().toUpperCase(),
                kmAtual: Number(novoKm)
            },
            "Viatura atualizada.",
            "Erro ao atualizar viatura."
        );

    }

    catch (error) {

        console.error(
            "Erro ao editar viatura:",
            error
        );

        alert(
            "Erro ao atualizar viatura."
        );
    }

};

// ==========================================
// ALTERAR STATUS
// ==========================================


let viaturaEntradaOperacao = null;

window.abrirEntradaOperacao = function(id){

    viaturaEntradaOperacao = id;

    preencherMotoristasOperacao();

    abrirModal("modalEntradaOperacao");

}

window.alterarStatusViatura =
async (
    id,
    novoStatus
) => {

    try {

        await updateDoc(

            doc(
                db,
                "viaturas",
                id
            ),

            {
                status:
                    novoStatus
            }

        );

    } catch (error) {

        console.error(
            "Erro ao alterar status:",
            error
        );
    }
};

window.baixarViatura =
async function(id){

    const motivo = prompt(
        "Informe o motivo da baixa:"
    );

    if(!motivo) return;

    await updateDoc(

        doc(
            db,
            "viaturas",
            id
        ),

        {

            status:
                "BAIXADA",

            motivoBaixa:
                motivo,

            dataBaixa:
                serverTimestamp()

        }

    );

    alert(
        "Viatura baixada."
    );

};


window.adicionarKmPercorrido =
async (id) => {

    const km =
        prompt(
            "Digite o KM percorrido:"
        );

    if (!km) return;

    try {

        await updateDoc(

            doc(
                db,
                "teatro_operacoes",
                id
            ),

            {

                kmPercorrido:
                    Number(km)

            }

        );

        alert(
            "KM atualizado."
        );

    }

    catch (error) {

        console.error(error);

    }

};


// ==========================================
// REFERÊNCIA FIREBASE
// ==========================================

const motoristasRef =
    collection(
        db,
        "motoristas"
    );


// ==========================================
// ABRIR MODAL MOTORISTA
// ==========================================

window.abrirModalMotorista =
() => {

    const modal =
        document.getElementById(
            "modalMotorista"
        );

    if (modal) {

        modal.classList.remove(
            "hidden"
        );
    }

};


// ==========================================
// SALVAR MOTORISTA
// ==========================================

window.salvarMotorista =
async () => {

    const nomeInput =
        document.getElementById(
            "motoristaNome"
        );

    const graduacaoInput =
        document.getElementById(
            "motoristaGraduacao"
        );

    const matriculaInput =
        document.getElementById(
            "motoristaMatricula"
        );

    if (
        !nomeInput ||
        !graduacaoInput ||
        !matriculaInput
    ) {

        alert(
            "Campos do motorista não encontrados."
        );

        return;
    }

    // ==================================
    // CAPTURA DOS DADOS
    // ==================================

    const nome =
        nomeInput.value.trim();

    const graduacao =
        graduacaoInput.value.trim();

    const matricula =
        matriculaInput.value.trim();

    const pelotao =
        document.getElementById(
            "motoristaPelotao"
        )?.value;

    const tipo =
        document.getElementById(
            "motoristaTipo"
        )?.value;

    // ==================================
    // VALIDAÇÃO
    // ==================================

    if (
        !nome ||
        !graduacao ||
        !matricula ||
        !pelotao ||
        !tipo
    ) {

        alert(
            "Preencha todos os campos."
        );

        return;
    }

    try {

        // ==================================
        // VERIFICA MATRÍCULA DUPLICADA
        // ==================================

        const motoristaQuery =
            query(

                motoristasRef,

                where(
                    "matricula",
                    "==",
                    matricula
                )

            );

        const resultado =
            await getDocs(
                motoristaQuery
            );

        if (!resultado.empty) {

            alert(
                "Já existe um motorista com essa matrícula."
            );

            return;
        }

        // ==================================
        // SALVAR FIREBASE
        // ==================================

        await addDoc(

            motoristasRef,

            {

                nome,
                graduacao,
                matricula,
                pelotao,
                tipo,

                createdAt:
                    serverTimestamp()

            }

        );

        alert(
            "Motorista cadastrado com sucesso."
        );

        // ==================================
        // LIMPAR FORMULÁRIO
        // ==================================

        nomeInput.value = "";
        graduacaoInput.value = "";
        matriculaInput.value = "";

        document.getElementById(
            "motoristaPelotao"
        ).value = "";

        document.getElementById(
            "motoristaTipo"
        ).value = "";

        fecharModal(
            "modalMotorista"
        );

    }

    catch (error) {

        console.error(
            "Erro ao salvar motorista:",
            error
        );

        alert(
            "Erro ao cadastrar motorista."
        );

    }

};

// ==========================================
// LISTAR MOTORISTAS EM TEMPO REAL
// ==========================================

onSnapshot(

    motoristasRef,

    (snapshot)=>{

        // =====================================
        // LIMPA O CACHE
        // =====================================

        atualizarStatusSistema("online");

        cache.motoristas = [];

        const selectMotorista =
            document.getElementById("teatroMotorista");

        const selectComandante =
            document.getElementById("teatroComandante");

        const selectP1 =
            document.getElementById("teatroP1");

        const selectP2 =
            document.getElementById("teatroP2");

        const listaMotoristas =
            document.getElementById(
                "listaMotoristas"
            );

        const totalMotoristas =
            document.getElementById(
                "totalMotoristas"
            );

        if(listaMotoristas){

            listaMotoristas.innerHTML = "";

        }

        if(selectMotorista)
            selectMotorista.innerHTML =
                '<option value="">Selecione</option>';

        if(selectComandante)
            selectComandante.innerHTML =
                '<option value="">Selecione</option>';

        if(selectP1)
            selectP1.innerHTML =
                '<option value="">Selecione</option>';

        if(selectP2)
            selectP2.innerHTML =
                '<option value="">Selecione</option>';

        
        const selectOperacao =
        document.getElementById("motoristaOperacao");

        const selectChecklist =
        document.getElementById("checkMotorista");

        if(selectOperacao)
            selectOperacao.innerHTML = "";

        if(selectChecklist)
            selectChecklist.innerHTML =
                '<option value="">Selecione</option>';

        snapshot.forEach((docItem)=>{

            // =====================================
            // DADOS DO MOTORISTA
            // =====================================

            const motorista =
                docItem.data();

            const id =
                docItem.id;

            // =====================================
            // SALVA NO CACHE
            // =====================================

            cache.motoristas.push({

                id,

                ...motorista

            });

            if(listaMotoristas){

                listaMotoristas.innerHTML += `

                <div class="viatura-card">

                    <div class="viatura-content">

                        <h3>

                            ${motorista.graduacao}
                            ${motorista.nome}

                        </h3>

                        <p>

                            <strong>Matrícula:</strong>

                            ${motorista.matricula}

                        </p>

                        <p>

                            <strong>Equipe:</strong>

                            ${motorista.pelotao}

                        </p>

                        <p>

                            <strong>Tipo:</strong>

                            ${motorista.tipo}

                        </p>

                        <div class="card-actions">

                            <button
                                class="btn-edit"
                                onclick="editarMotorista('${id}')">

                                Editar

                            </button>

                            <button
                                class="btn-delete"
                                onclick="removerMotorista('${id}')">

                                Remover

                            </button>

                        </div>

                    </div>

                </div>

                `;

            }

            // =====================================
            // OPTION
            // =====================================

            const option = `

                <option value="${id}">

                    ${motorista.graduacao}
                    ${motorista.nome}

                </option>

            `;

            if(selectMotorista)
                selectMotorista.innerHTML += option;

            if(selectComandante)
                selectComandante.innerHTML += option;

            if(selectP1)
                selectP1.innerHTML += option;

            if(selectP2)
                selectP2.innerHTML += option;

            if(selectOperacao)
                selectOperacao.innerHTML += option;

            if(selectChecklist)
                selectChecklist.innerHTML += option;

        });

        if(totalMotoristas){

            totalMotoristas.innerText =
                snapshot.size;

        }

    }

);

function preencherMotoristasOperacao(){

    const select =
        document.getElementById(
            "motoristaOperacao"
        );

    if(!select) return;

    select.innerHTML = "";

    cache.motoristas.forEach(m=>{

        if(m.tipo !== "OPERACIONAL")
            return;

        const nomeCompleto =
            `${m.graduacao} ${m.nome}`;

        select.innerHTML += `

            <option value="${m.id}">

                ${nomeCompleto}

            </option>

        `;

    });

}

window.filtrarSelectMotoristas = function(campoBusca, selectDestino){

    const texto =
        document
            .getElementById(campoBusca)
            .value
            .trim()
            .toLowerCase();

    const select =
        document.getElementById(selectDestino);

        console.log("Campo:", campoBusca);
        console.log("Select:", selectDestino);
        console.log("Texto:", texto);
        console.log("Qtd Motoristas:", cache.motoristas.length);

    if(!select) return;

    const valorAtual = select.value;

    select.innerHTML = `
        <option value="">
            Selecione
        </option>
    `;

    cache.motoristas

        .filter(m=>{

            const pesquisa = `
                ${m.nome}
                ${m.graduacao}
                ${m.matricula}
                ${m.pelotao}
            `.toLowerCase();

            const palavras = texto
                .split(" ")
                .filter(p => p.length > 0);

            return palavras.every(p => pesquisa.includes(p));

        })

        .sort((a,b)=>{

            return a.nome.localeCompare(
                b.nome,
                "pt-BR"
            );

        })

        .forEach(m=>{

            const option =
                document.createElement("option");

            option.value = m.id;

            option.textContent =
                `${m.graduacao} ${m.nome}`;

            if(m.id === valorAtual){

                option.selected = true;

            }

            select.appendChild(option);

        });

        if(
            valorAtual &&
            [...select.options].some(
                o=>o.value===valorAtual
            )
        ){

            select.value = valorAtual;

        }

        if (select.options.length > 1) {

            select.selectedIndex = 1;

        }

        if(select.options.length){

            select.selectedIndex = 0;

        }

}


// =====================================
// CONFIRMAR ENTRADA EM OPERAÇÃO
// =====================================

window.confirmarEntradaOperacao = async function () {

    const motoristaId =
        document.getElementById(
            "motoristaOperacao"
        ).value;

    if (!motoristaId) {

        alert("Selecione um motorista.");

        return;

    }

    const motorista =
        cache.motoristas.find(
            m => m.id === motoristaId
        );

    const viatura =
        cache.viaturas.find(
            v => v.id === viaturaEntradaOperacao
        );

    if (!motorista || !viatura) {

        alert("Dados não encontrados.");

        return;

    }

    try {

        // Atualiza a viatura

        await updateDoc(

            doc(
                db,
                "viaturas",
                viatura.id
            ),

            {

                status: "EM USO"

            }

        );

        // Cria automaticamente a operação

        await addDoc(

            teatroRef,

            {

                viaturaId: viatura.id,

                nomeViatura: viatura.nome,

                placa: viatura.placa,

                motorista: motorista.id,

                motoristaNome:
                    `${motorista.graduacao} ${motorista.nome}`,

                comandante: "",

                p1: "",

                p2: "",

                servico: "",

                area: "",

                contato: "",

                status: "ATIVA",

                createdAt:
                    serverTimestamp()

            }

        );

        fecharModal(
            "modalEntradaOperacao"
        );

        alert("Operação iniciada com sucesso.");

    }

    catch (erro) {

        console.error(erro);

        alert("Erro ao iniciar operação.");

    }

}


// ==========================================
// REMOVER MOTORISTA
// ==========================================

window.removerMotorista =
async (id) => {

    const confirmar =
        confirm(
            "Deseja remover este motorista?"
        );

    if (!confirmar)
        return;

    await removerDocumento(
        "motoristas",
        id,
        "Motorista removido.",
        "Erro ao remover motorista."
    );
};


// ==========================================
// EDITAR MOTORISTA
// ==========================================

window.editarMotorista =
async (id) => {

    try {

        const motoristaRef =
            doc(
                db,
                "motoristas",
                id
            );

        const motoristaSnap =
            await getDoc(
                motoristaRef
            );

        if (
            !motoristaSnap.exists()
        ) {

            alert(
                "Motorista não encontrado."
            );

            return;
        }

        const dados =
            motoristaSnap.data();

        // ==================================
        // EDIÇÃO DOS CAMPOS
        // ==================================

        const novoNome =
            prompt(
                "Nome do integrante:",
                dados.nome || ""
            );

        if (!novoNome)
            return;

        const novaGraduacao =
            prompt(
                "Função:",
                dados.graduacao || ""
            );

        if (!novaGraduacao)
            return;

        const novaMatricula =
            prompt(
                "Matrícula:",
                dados.matricula || ""
            );

        if (!novaMatricula)
            return;

        // ==================================
        // PELOTÃO
        // ==================================

        const novoPelotao =
            prompt(
                "Equipe (1, 2, 3 ou 4):",
                dados.pelotao || "Equipe 1"
            );

        if (!novoPelotao)
            return;

        // ==================================
        // TIPO SERVIÇO
        // ==================================

        const novoTipo =
            prompt(
                "Tipo (Operacional ou Administrativo):",
                dados.tipo || "Operacional"
            );

        if (!novoTipo)
            return;

        // ==================================
        // UPDATE FIREBASE
        // ==================================

        await atualizarDocumento(
            "motoristas",
            id,
            {
                nome: novoNome.trim(),
                graduacao: novaGraduacao.trim(),
                matricula: novaMatricula.trim(),
                pelotao: novoPelotao.trim(),
                tipo: novoTipo.trim()
            },
            "Integrante atualizado com sucesso.",
            "Erro ao atualizar integrante."
        );

    }

    catch (error) {

        console.error(
            "Erro ao editar:",
            error
        );

        alert(
            "Erro ao atualizar integrante."
        );

    }

};

// ==========================================
// TEATRO DE OPERAÇÕES
// ==========================================

const teatroRef =
    collection(
        db,
        "teatro_operacoes"
    );



    // ==========================================
    // FICHAS DE AVARIA
    // ==========================================

    const fichasAvariaRef =
        collection(
            db,
            "fichas_avaria"
        );

        const fotosAvariaRef =

            collection(
                db,
                "fotos_avaria"
            );


        // ==========================================
        // NUMERAÇÃO FICHA AVARIA
        // ==========================================

        async function gerarNumeroFicha(){

            const ano =
                new Date().getFullYear();

            const snapshot =
                await getDocs(
                    fichasAvariaRef
                );

            const numero =
                snapshot.size + 1;

            return `FROTA DEMO-${ano}-${numero
                .toString()
                .padStart(6,"0")}`;

        }
// ==========================================
// ABRIR MODAL
// ==========================================

window.abrirModalTeatro =
() => {

    const modal =
        document.getElementById(
            "modalTeatro"
        );

    if (modal) {

        modal.classList.remove(
            "hidden"
        );
    }

};


// ==========================================
// CARREGAR VIATURAS NOS SELECTS
// (somente LIVRES)
// ==========================================

onSnapshot(

    viaturasRef,

    (snapshot) => {

        const selectViatura =
            document.getElementById(
                "teatroViatura"
            );

        if (!selectViatura)
            return;

        selectViatura.innerHTML = `
            <option value="">
                Selecione a viatura
            </option>
        `;

        snapshot.forEach(
            (docItem) => {

            const viatura =
                docItem.data();

            // SOMENTE VIATURA LIVRE

            if (
                viatura.status !==
                "LIVRE"
            ) return;

            selectViatura.innerHTML += `

                <option
                    value="${docItem.id}"
                >

                    ${viatura.nome}
                    —
                    ${viatura.placa}

                </option>

            `;
        });

    }

);


// ==========================================
// SALVAR OPERAÇÃO
// ==========================================

window.salvarTeatro =
async () => {

    const viaturaId =
        document.getElementById(
            "teatroViatura"
        )?.value;

    const motorista =
        document.getElementById(
            "teatroMotorista"
        )?.value;

    const comandante =
        document.getElementById(
            "teatroComandante"
        )?.value;

    const p1 =
        document.getElementById(
            "teatroP1"
        )?.value || "";

    const p2 =
        document.getElementById(
            "teatroP2"
        )?.value || "";

    async function buscarPolicial(id){

        if(!id) return null;

        const snap = await getDoc(

            doc(
                db,
                "motoristas",
                id
            )

        );

        if(!snap.exists()){

            return null;

        }

        return snap.data();

    }

    // ==========================================
    // BUSCAR NOMES DA EQUIPE
    // ==========================================

    const motoristaObj =
    await buscarPolicial(
        motorista
    );

    const comandanteObj =
        await buscarPolicial(
            comandante
        );

    const p1Obj =
        await buscarPolicial(
            p1
        );

    const p2Obj =
        await buscarPolicial(
            p2
        );

    const motoristaNome =
        motoristaObj
            ? `${motoristaObj.graduacao} ${motoristaObj.nome}`
            : "";

    const comandanteNome =
        comandanteObj
            ? `${comandanteObj.graduacao} ${comandanteObj.nome}`
            : "";

    const p1Nome =
        p1Obj
            ? `${p1Obj.graduacao} ${p1Obj.nome}`
            : "";

    const p2Nome =
        p2Obj
            ? `${p2Obj.graduacao} ${p2Obj.nome}`
            : "";

    const servico =
        document.getElementById(
            "teatroServico"
        )?.value;

    const area =
        document.getElementById(
            "teatroArea"
        )?.value
        .trim();

    const contato =
        document.getElementById(
            "teatroContato"
        )?.value
        .trim();

    // ==========================
    // VALIDAÇÃO
    // ==========================

    if (
        !viaturaId ||
        !motorista ||
        !comandante
    ) {

        alert(
            "Preencha os campos obrigatórios."
        );

        return;
    }

    try {

        // ==========================
        // BUSCAR VIATURA
        // ==========================

        const viaturaSnap =
            await getDoc(

                doc(
                    db,
                    "viaturas",
                    viaturaId
                )

            );

        if (
            !viaturaSnap.exists()
        ) {

            alert(
                "Viatura não encontrada."
            );

            return;
        }

        const viatura =
            viaturaSnap.data();

       // ==================================
        // IMPEDIR DUPLICIDADE
        // SOMENTE EM NOVO CADASTRO
        // ==================================

        if (

            viatura.status === "EM USO"

            &&

            !window.editandoTeatro

        ) {

            alert(
                "Essa viatura já está em operação."
            );

            return;

        }
        

       // ==========================
        // DADOS
        // ==========================

        const dadosOperacao = {

            viaturaId,

            nomeViatura:
                viatura.nome,

            placa:
                viatura.placa,

            motorista,
            motoristaNome,

            comandante,
            comandanteNome,

            p1,
            p1Nome,

            p2,
            p2Nome,

            servico,

            area,

            contato,

            status:"ATIVA"

        };

        // ==========================
        // EDITAR
        // ==========================

        if(window.editandoTeatro){

            await updateDoc(

                doc(
                    db,
                    "teatro_operacoes",
                    window.editandoTeatro
                ),

                {

                    ...dadosOperacao,

                    updatedAt:
                        serverTimestamp()

                }

            );

            

        }

        else{

            await addDoc(

                teatroRef,

                {

                    ...dadosOperacao,

                    createdAt:
                        serverTimestamp()

                }

            );

        }

            

        // ==========================
        // ALTERAR STATUS VIATURA
        // ==========================

        await updateDoc(

            doc(
                db,
                "viaturas",
                viaturaId
            ),

            {

                status:
                    "EM USO"

            }

        );

        // ==========================
        // HISTÓRICO
        // ==========================

        await addDoc(

            collection(
                db,
                "historico"
            ),

            {

                tipo:"teatro",

                descricao:
                    `Viatura ${viatura.nome} entrou em operação`,

                viatura:
                    viatura.nome,

                placa:
                    viatura.placa,

                motorista,
                motoristaNome,

                comandante,
                comandanteNome,

                p1,
                p1Nome,

                p2,
                p2Nome,

                servico,

                area,

                contato,

                status:"ATIVA",

                createdAt:
                    serverTimestamp()

            }

        );

        alert(
            "Operação cadastrada."
        );

        document.getElementById(
            "teatroViatura"
        ).value = "";

        document.getElementById(
            "teatroMotorista"
        ).value = "";

        document.getElementById(
            "teatroComandante"
        ).value = "";

        document.getElementById(
            "teatroP1"
        ).value = "";

        document.getElementById(
            "teatroP2"
        ).value = "";

        document.getElementById(
            "teatroServico"
        ).value = "";

        document.getElementById(
            "teatroArea"
        ).value = "";

        document.getElementById(
            "teatroContato"
        ).value = "";

        window.editandoTeatro =
            null;

        fecharModal(
            "modalTeatro"
        );

    }

    catch (error) {

        console.error(
            "Erro ao salvar operação:",
            error
        );

        alert(
            "Erro ao cadastrar operação."
        );
    }

};

// ==========================================
// LISTAR OPERAÇÕES
// ==========================================

onSnapshot(

    teatroRef,

    (snapshot) => {

        atualizarStatusSistema("online");

        

        const lista =
            document.getElementById(
                "listaTeatro"
            );

        if (!lista)
            return;

        lista.innerHTML = "";

        snapshot.forEach(
            (docItem) => {

            const op =
                docItem.data();

            const id =
                docItem.id;

            const card = `

            <div class="viatura-card">

                <img
                    src="assets/demo-viatura.svg"
                    class="viatura-imagem"
                >

                <div class="viatura-content">

                    <h3>
                        ${op.nomeViatura}
                    </h3>

                    <p class="viatura-info">

                        <strong>Motorista:</strong>

                        ${op.motoristaNome || "-"}

                    </p>

                    <p class="viatura-info">

                        <strong>Comandante:</strong>

                        ${op.comandanteNome || "-"}

                    </p>

                    <p class="viatura-info">

                        <strong>P1:</strong>

                        ${op.p1Nome || "-"}

                    </p>

                    <p class="viatura-info">

                        <strong>P2:</strong>

                        ${op.p2Nome || "-"}

                    </p>

                    <p class="viatura-info">

                        <strong>Serviço:</strong>

                        ${op.servico}

                    </p>

                    <span
                        class="
                            status-badge
                            status-uso
                        "
                    >

                        EM OPERAÇÃO

                    </span>

                    <div class="card-actions">

                        <button
                            class="btn-details"
                            onclick="
                                detalhesTeatro(
                                    '${id}'
                                )
                            "
                        >

                            Detalhes

                        </button>

                        <button
                            class="btn-edit"
                            onclick="
                                editarTeatro(
                                    '${id}'
                                )
                            "
                        >

                            Editar

                        </button>

                        <button
                            class="btn-km"
                            onclick="
                                adicionarKmPercorrido(
                                    '${id}'
                                )
                            ">

                            KM Percorrido

                        </button>

                        <button
                            class="btn-delete"
                            onclick="
                                removerTeatro(
                                    '${id}',
                                    '${op.viaturaId}'
                                )
                            "
                        >

                            Finalizar

                        </button>

                    </div>

                </div>

            </div>

            `;

            lista.innerHTML +=
                card;

        });

    },

    (error) => {

        console.error(
            "Erro no teatro:",
            error
        );

    }

);


// ==========================================
// DETALHES DA OPERAÇÃO
// ==========================================

window.detalhesTeatro =
async (id) => {

    try {

        const modal =
            document.getElementById(
                "modalDetalhes"
            );

        const conteudo =
            document.getElementById(
                "detalhesConteudo"
            );

        if (
            !modal ||
            !conteudo
        ) return;

        const docRef =
            await getDoc(

                doc(
                    db,
                    "teatro_operacoes",
                    id
                )

            );

        if (
            !docRef.exists()
        ) {

            alert(
                "Registro não encontrado."
            );

            return;
        }

        const dados =
            docRef.data();

        conteudo.innerHTML = `

            <div class="detalhes-box">

                <h2>
                    ${dados.nomeViatura}
                </h2>

                <p>
                    <strong>Placa:</strong>
                    ${dados.placa}
                </p>

                <p>
                    <strong>Motorista:</strong>
                    ${dados.motoristaNome || "-"}
                </p>

                <p>
                    <strong>Comandante:</strong>
                    ${dados.comandanteNome || "-"}
                </p>

                <p>
                    <strong>P1:</strong>
                    ${dados.p1Nome || "-"}
                </p>

                <p>
                    <strong>P2:</strong>
                    ${dados.p2Nome || "-"}
                </p>

                <p>
                    <strong>Serviço:</strong>
                    ${dados.servico}
                </p>

                <p>
                    <strong>Área:</strong>
                    ${dados.area || "-"}
                </p>

                <p>
                    <strong>Contato:</strong>
                    ${dados.contato || "-"}
                </p>

                <p>
                    <strong>
                        KM Percorrido:
                    </strong>
                    ${
                        dados.kmPercorrido ||
                        0
                    } km
                </p>

            </div>

        `;

        modal.classList.remove(
            "hidden"
        );

    }

    catch (error) {

        console.error(error);

    }

};

// ==========================================
// EDITAR TEATRO
// ==========================================

window.editarTeatro =
async (id) => {

    try {

        const teatroSnap =

            await getDoc(

                doc(
                    db,
                    "teatro_operacoes",
                    id
                )

            );

        if(!teatroSnap.exists()){

            alert(
                "Operação não encontrada."
            );

            return;

        }

        const dados =
            teatroSnap.data();

        // ==================================
        // PREENCHER CAMPOS
        // ==================================

        // ==================================
        // ABRIR MODAL PRIMEIRO
        // ==================================

        abrirModal(
            "modalTeatro"
        );

        // ==================================
        // AGUARDAR SELECTS CARREGAREM
        // ==================================

        setTimeout(() => {

            const selectViatura =
                document.getElementById(
                    "teatroViatura"
                );

            if(selectViatura){

                // adiciona a viatura atual caso
                // não esteja na lista

                const existeOpcao = Array
                    .from(selectViatura.options)
                    .some(opcao =>
                        opcao.value === dados.viaturaId
                    );

                if(!existeOpcao){

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        dados.viaturaId;

                    option.text =
                        `${dados.nomeViatura} — ${dados.placa}`;

                    selectViatura.appendChild(
                        option
                    );

                }

                selectViatura.value =
                    dados.viaturaId;

            }

        }, 200);

        document.getElementById(
            "teatroMotorista"
        ).value =
            dados.motorista || "";

        document.getElementById(
            "teatroComandante"
        ).value =
            dados.comandante || "";

        document.getElementById(
            "teatroP1"
        ).value =
            dados.p1 || "";

        document.getElementById(
            "teatroP2"
        ).value =
            dados.p2 || "";

        document.getElementById(
            "teatroServico"
        ).value =
            dados.servico || "";

        document.getElementById(
            "teatroArea"
        ).value =
            dados.area || "";

        document.getElementById(
            "teatroContato"
        ).value =
            dados.contato || "";

        // ==================================
        // MODO EDIÇÃO
        // ==================================

        window.editandoTeatro =
            id;


    }

    catch(error){

        console.error(
            "Erro ao editar teatro:",
            error
        );

    }

};

// ==========================================
// FINALIZAR OPERAÇÃO
// ==========================================

window.removerTeatro =
async (
    id,
    viaturaId
) => {

    const confirmar =
        confirm(
            "Finalizar operação?"
        );

    if (!confirmar)
        return;

    try {

        const snap =
            await getDoc(
                doc(db, "teatro_operacoes", id)
            );

        const dados = snap.data();

        await removerDocumento("teatro_operacoes", id, "Operação finalizada.", "Erro ao finalizar.");

        await atualizarDocumento("viaturas", viaturaId, { status: "LIVRE" }, "", "");

        await addDoc(
            collection(db, "historico"),
            {
                tipo: "teatro",
                descricao: `Operação finalizada da viatura ${dados?.nomeViatura || ""}`,
                viatura: dados?.nomeViatura || "",
                placa: dados?.placa || "",
                motorista: dados?.motorista || "",
                motoristaNome: dados?.motoristaNome || "",
                comandante: dados?.comandante || "",
                comandanteNome: dados?.comandanteNome || "",
                p1: dados?.p1 || "",
                p1Nome: dados?.p1Nome || "",
                p2: dados?.p2 || "",
                p2Nome: dados?.p2Nome || "",
                kmPercorrido: dados?.kmPercorrido || 0,
                area: dados?.area || "",
                servico: dados?.servico || "",
                contato: dados?.contato || "",
                status: "FINALIZADA",
                createdAt: serverTimestamp()
            }
        );

    }

    catch (error) {

        console.error(error);

        alert("Erro ao finalizar.");

    }

};


// ==========================================
// ABRIR CHECKLIST
// ==========================================
window.abrirChecklist =
async function (viaturaId) {

    const modal =
        document.getElementById(
            "modalChecklist"
        );

    const inputId =
        document.getElementById(
            "viaturaChecklistId"
        );

    if (!modal || !inputId) {
        return;
    }

    inputId.value =
        viaturaId;

    await carregarUltimoChecklist(
        viaturaId
    );

    modal.classList.remove(
        "hidden"
    );
};

    // ==========================================
// ÚLTIMO CHECKLIST
// ==========================================

async function carregarUltimoChecklist(
    viaturaId
) {

    const viaturaSnap =
    await getDoc(

        doc(
            db,
            "viaturas",
            viaturaId
        )

    );

    const viatura =
    viaturaSnap.data();

    const container =
        document.getElementById(
            "ultimoChecklistInfo"
        );

    if (!container) return;

    container.innerHTML =
    `
        <p>
            Carregando checklist...
        </p>
    `;

    try {

        const q = query(

            collection(
                db,
                "checklists"
            ),

            where(
                "viaturaId",
                "==",
                viaturaId
            )

        );

        const snapshot =
            await getDocs(q);

        if (snapshot.empty) {

            container.innerHTML =
            `
                <p>
                    Nenhum checklist anterior.
                </p>
            `;

            return;
        }

        const lista = [];

        snapshot.forEach((docItem) => {

            lista.push(
                docItem.data()
            );

        });

        lista.sort((a, b) => {

            const dataA =
                a.createdAt?.seconds || 0;

            const dataB =
                b.createdAt?.seconds || 0;

            return dataB - dataA;
        });

        const dados = lista[0];


                document.getElementById(
                "checkMotorista"
            ).value =
                dados.motorista || "";

            document.getElementById(
                "checkServico"
            ).value =
                dados.servico || "Ordinário";

            document.getElementById(
                "checkKmInicial"
            ).value =
                dados.kmInicial || "";

            document.getElementById(
                "checkAvarias"
            ).value =
                dados.avarias || "";

            document.getElementById(
            "checkKmTrocaOleo"
        ).value =
            viatura?.kmTrocaOleo || "";

            if (dados.itens) {

                document.getElementById(
                    "chaveRoda"
                ).checked =
                    dados.itens.chaveRoda || false;

                document.getElementById(
                    "hastePneu"
                ).checked =
                    dados.itens.hastePneu || false;

                document.getElementById(
                    "macaco"
                ).checked =
                    dados.itens.macaco || false;

                document.getElementById(
                    "triangulo"
                ).checked =
                    dados.itens.triangulo || false;

                document.getElementById(
                    "pneuReserva"
                ).checked =
                    dados.itens.pneuReserva || false;

                document.getElementById(
                    "limpeza"
                ).checked =
                    dados.itens.limpeza || false;

            }

    }

    catch (error) {

        console.error(
            "Erro checklist:",
            error
        );

    }

}



// ==========================================
// SALVAR CHECKLIST
// ==========================================

window.salvarChecklist =
async () => {

    try {

        // ==================================
        // CAPTURA DOS CAMPOS
        // ==================================

        const viaturaId =
            document.getElementById(
                "viaturaChecklistId"
            )?.value;

        const motorista =
            document.getElementById(
                "checkMotorista"
            )?.value;

        const motoristaSelecionado =
            cache.motoristas.find(
                item => item.id === motorista
            );

        const motoristaNome =
            motoristaSelecionado
                ? `${motoristaSelecionado.graduacao || ""} ${motoristaSelecionado.nome || ""}`.trim()
                : "";

        const servico =
            document.getElementById(
                "checkServico"
            )?.value;

        const kmInicial =
            Number(
                document.getElementById(
                    "checkKmInicial"
                )?.value
            );

        const avarias =
            document.getElementById(
                "checkAvarias"
            )?.value?.trim() || "";

        const inputFotos =
            document.getElementById(
                "checkFotos"
            );

        // ==================================
        // ARQUIVOS
        // ==================================

        const arquivos =
            inputFotos?.files || [];

        // ==================================
        // TIPOS PERMITIDOS
        // ==================================

        const tiposPermitidos = [

            "image/jpeg",
            "image/png",
            "image/webp"

        ];

        // ==================================
        // VALIDAR ARQUIVOS
        // ==================================

        for (const arquivo of arquivos) {

            if (
                !tiposPermitidos.includes(
                    arquivo.type
                )
            ) {

                alert(
                    "Apenas imagens são permitidas."
                );

                return;
            }

        }

        // ==================================
        // VALIDAÇÃO
        // ==================================

        if (
            !viaturaId ||
            !motorista ||
            isNaN(kmInicial)
        ) {

            alert(
                "Preencha os campos obrigatórios."
            );

            return;
        }

        // ==================================
        // LIMITAR FOTOS
        // ==================================


        if (     arquivos.length > 15 ) {

            alert(
                "Máximo permitido: 15 fotos."
            );

            return;
        }

        // ==================================
        // UPLOAD REAL FIREBASE STORAGE
        // ==================================
            alert(
                "Enviando checklist, aguarde..."
            );

        const fotosUrls = [];

        for (
            let i = 0;
            i < arquivos.length;
            i++
        ) {

            const arquivo =
                arquivos[i];

            const nomeArquivo =
                `${Date.now()}_${arquivo.name}`;

            const storageRef =
                ref(

                    storage,

                    `checklists/${nomeArquivo}`

                );

            // upload

            await uploadBytes(

                storageRef,
                arquivo

            );

            // url download

            const url =
                await getDownloadURL(
                    storageRef
                );

            fotosUrls.push(
                url
            );

        }

        // ==================================
        // PEGAR STATUS DOS ITENS
        // ==================================

        const itens = {

            chaveRoda:
                document.getElementById(
                    "chaveRoda"
                )?.checked || false,

            hastePneu:
                document.getElementById(
                    "hastePneu"
                )?.checked || false,

            macaco:
                document.getElementById(
                    "macaco"
                )?.checked || false,

            triangulo:
                document.getElementById(
                    "triangulo"
                )?.checked || false,

            pneuReserva:
                document.getElementById(
                    "pneuReserva"
                )?.checked || false,

            limpeza:
                document.getElementById(
                    "limpeza"
                )?.checked || false

        };

        // ==================================
        // BUSCAR DADOS DA VIATURA
        // ==================================

        const viaturaSnap =
            await getDoc(

                doc(
                    db,
                    "viaturas",
                    viaturaId
                )

            );

        const viatura =
            viaturaSnap.data();

                        if (
                            viatura?.kmTrocaOleo &&
                            kmInicial >=
                            viatura.kmTrocaOleo
                        ) 
                        {

                            alert(
                                `⚠️ Atenção:
                                     A viatura ${
                                    viatura.nome
                                } precisa de troca de óleo!`
                            );

                        }

        // ==================================
        // SALVAR CHECKLIST
        // ==================================

        await addDoc(

            collection(
                db,
                "checklists"
            ),

            {

                viaturaId,

                nomeViatura:
                    viatura?.nome || "",

                placa:
                    viatura?.placa || "",

                motorista,
                motoristaNome,
                servico,
                kmInicial,
                avarias,

                itens,

                fotos:
                    fotosUrls,

                createdAt:
                    serverTimestamp()

            }

        );


       const alertaTrocaOleo =
    kmInicial >=
    Number(
        document.getElementById(
            "checkKmTrocaOleo"
        )?.value || 0
    );

    await updateDoc(

        doc(
            db,
            "viaturas",
            viaturaId
        ),

        {

            kmAtual:
                kmInicial,

            motoristaUltimo:
                motorista,

            servicoUltimo:
                servico,

            avariasUltimo:
                avarias,

            kmTrocaOleo:
                Number(
                    document.getElementById(
                        "checkKmTrocaOleo"
                    )?.value
                ) || 0,

            itensChecklist:
                itens,

            alertaTrocaOleo

        }

    );

        // ==================================
        // HISTÓRICO
        // ==================================

       await addDoc(

    collection(
        db,
        "historico"
    ),

    {

        tipo:
            "checklist",

        descricao:
            `Checklist realizado da viatura ${viatura?.nome}`,

        viatura:
            viatura?.nome || "",

        placa:
            viatura?.placa || "",

        motorista,
        motoristaNome,
        servico,
        kmInicial,

        avarias,

        itens,

        fotos:
            fotosUrls,

        createdAt: 
        serverTimestamp(),

        dataChecklist: 
        new Date().toISOString()

    }

);

        // ==================================
        // LIMPAR FORMULÁRIO
        // ==================================

        document.getElementById(
            "checkKmInicial"
        ).value = "";

        document.getElementById(
            "checkAvarias"
        ).value = "";

        document.getElementById(
            "checkFotos"
        ).value = "";

        // limpar checkboxes

        [

            "chaveRoda",
            "hastePneu",
            "macaco",
            "triangulo",
            "pneuReserva",
            "limpeza"

        ].forEach((id) => {

            const item =
                document.getElementById(
                    id
                );

            if (item) {

                item.checked =
                    false;
            }

        });

        fecharModal(
            "modalChecklist"
        );

        alert(
            "Checklist salvo com sucesso."
        );

    }

    catch (error) {

        console.error(
            "Erro checklist:",
            error
        );

        alert(
            "Erro ao salvar checklist."
        );
    }

};


// ==========================================
// GALERIA DE FOTOS DO CHECKLIST
// ==========================================

window.mostrarFotosChecklist =
(fotos = []) => {

    const conteudo =
        document.getElementById(
            "detalhesConteudo"
        );

    const modal =
        document.getElementById(
            "modalDetalhes"
        );

    if (
        !conteudo ||
        !modal
    ) return;

    if (
        fotos.length === 0
    ) {

        conteudo.innerHTML = `
            <h3>
                Nenhuma foto disponível
            </h3>
        `;

        modal.classList.remove(
            "hidden"
        );

        return;
    }

    let html = `
        <div class="galeria-checklist">
    `;

    fotos.forEach((foto) => {

        html += `

            <img
                src="${foto}"
                class="foto-checklist"
                onclick="
                    window.open(
                        '${foto}',
                        '_blank'
                    )
                "
            >

        `;
    });

    html += `
        </div>
    `;

    conteudo.innerHTML =
        html;

    modal.classList.remove(
        "hidden"
    );

};
// ==========================================
// MANUTENÇÃO
// ==========================================

const manutencaoRef =
    collection(
        db,
        "manutencoes"
    );


// ==========================================

// ==========================================
// CARREGAR SELECT MANUTENÇÃO
// (somente livres)
// ==========================================

onSnapshot(

    viaturasRef,

    (snapshot) => {

        const select =
            document.getElementById(
                "manutencaoViatura"
            );

        if (!select)
            return;

        select.innerHTML = `
            <option value="">
                Selecione a viatura
            </option>
        `;

        snapshot.forEach(
            (docItem) => {

            const viatura =
                docItem.data();

            if (
                viatura.status ===
                "EM USO"
            ) return;

            select.innerHTML += `

                <option
                    value="${docItem.id}"
                >

                    ${viatura.nome}
                    —
                    ${viatura.placa}

                </option>

            `;
        });

    }

);


// ==========================================
// SALVAR MANUTENÇÃO
// ==========================================

window.salvarManutencao =
async () => {

    const viaturaId =
        document.getElementById(
            "manutencaoViatura"
        )?.value;

    const tipo =
        document.getElementById(
            "manutencaoTipo"
        )?.value
        .trim();

    const oficina =
        document.getElementById(
            "manutencaoOficina"
        )?.value
        .trim();

    if (
        !viaturaId
        
    ) {

        alert(
            "Selecione a viatura."
        );

        return;
    }

    try {

        // ==========================
        // BUSCAR VIATURA
        // ==========================

        const viaturaSnap =
            await getDoc(

                doc(
                    db,
                    "viaturas",
                    viaturaId
                )

            );

        if (
            !viaturaSnap.exists()
        ) {

            alert(
                "Viatura não encontrada."
            );

            return;
        }

        const viatura =
            viaturaSnap.data();

        // impedir duplicidade

        if (

            viatura.status === "MANUTENCAO"

            &&

            !window.editandoManutencao

        ) {

            alert(
                "Viatura já está em manutenção."
            );

            return;

        }

        // ==========================
        // SALVAR MANUTENÇÃO
        // ==========================

        // ==========================
        // DADOS
        // ==========================

        const dadosManutencao = {

            viaturaId,

            nomeViatura:
                viatura.nome,

            placa:
                viatura.placa,

            tipo,

            oficina,

            status:
                "MANUTENCAO"

        };

        // ==========================
        // EDITAR OU CRIAR
        // ==========================

        if(window.editandoManutencao){

            await updateDoc(

                doc(
                    db,
                    "manutencoes",
                    window.editandoManutencao
                ),

                dadosManutencao

            );

            alert(
                "Manutenção atualizada."
            );

            window.editandoManutencao =
                null;

        }else{

            await addDoc(

                manutencaoRef,

                {

                    ...dadosManutencao,

                    createdAt:
                        serverTimestamp()

                }

            );

            alert(
                "Manutenção registrada."
            );

        }

        // ==========================
        // ALTERAR STATUS VIATURA
        // ==========================

        await updateDoc(

            doc(
                db,
                "viaturas",
                viaturaId
            ),

            {

                status:
                    "MANUTENCAO"

            }

        );

        // ==========================
        // HISTÓRICO
        // ==========================


        await addDoc(

            collection(
                db,
                "historico"
            ),

            {

                tipo:
                    "manutencao",

                descricao:
                    `Viatura ${viatura.nome} enviada para manutenção`,

                viatura:
                    viatura.nome,

                oficina,

                servico:
                     tipo || "-",

                createdAt:
                 serverTimestamp()

            }

        );

       window.editandoManutencao = null;

        fecharModal(
            "modalManutencao"
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Erro ao salvar manutenção."
        );

    }

};


// ==========================================
// LISTAR MANUTENÇÕES
// ==========================================

onSnapshot(

    manutencaoRef,

    (snapshot) => {

        const lista =
            document.getElementById(
                "listaManutencao"
            );

        if (!lista)
            return;

        lista.innerHTML = "";

        snapshot.forEach(
            (docItem) => {

            const item =
                docItem.data();

            const id =
                docItem.id;

            lista.innerHTML += `

            <div class="viatura-card">

                <img
                    src="assets/demo-viatura.svg"
                    class="viatura-imagem"
                >

                <div class="viatura-content">

                    <h3>
                        ${item.nomeViatura}
                    </h3>

                    <p class="viatura-info">

                        <strong>Placa:</strong>

                        ${item.placa}

                    </p>

                    <p class="viatura-info">

                        <strong>Serviço:</strong>

                        ${item.tipo}

                    </p>

                    <p class="viatura-info">

                        <strong>Oficina:</strong>

                        ${item.oficina}

                    </p>

                    <span class="
                        status-badge
                        status-manutencao
                    ">

                        MANUTENÇÃO

                    </span>

                    <div class="card-actions">

                        <button
                            class="btn-details"
                            onclick="
                                detalhesManutencao(
                                    '${id}'
                                )
                            "
                        >

                            Detalhes

                        </button>

                        <button
                            class="btn-edit"
                            onclick="
                                editarManutencao(
                                    '${id}'
                                )
                            "
                        >

                            Editar

                        </button>

                        <button
                            class="btn-delete"
                            onclick="
                                finalizarManutencao(
                                    '${id}',
                                    '${item.viaturaId}'
                                )
                            "
                        >

                            Finalizar

                        </button>

                    </div>

                </div>

            </div>

            `;

        });

    }

);


// ==========================================
// DETALHES MANUTENÇÃO
// ==========================================

window.detalhesManutencao =
async (id) => {

    try {

        const modal =
            document.getElementById(
                "modalDetalhes"
            );

        const conteudo =
            document.getElementById(
                "detalhesConteudo"
            );

        if (
            !modal ||
            !conteudo
        ) return;

        const manutencaoSnap =
            await getDoc(

                doc(
                    db,
                    "manutencoes",
                    id
                )

            );

        if (
            !manutencaoSnap.exists()
        ) {

            alert(
                "Registro não encontrado."
            );

            return;
        }

        const dados =
            manutencaoSnap.data();

        conteudo.innerHTML = `

            <div class="detalhes-box">

                <h2>
                    ${dados.nomeViatura}
                </h2>

                <p>

                    <strong>Placa:</strong>

                    ${dados.placa}

                </p>

                <p>

                    <strong>Serviço:</strong>

                    ${dados.tipo}

                </p>

                <p>

                    <strong>Oficina:</strong>

                    ${dados.oficina}

                </p>

                
                <p>

                    <strong>Status:</strong>

                    EM MANUTENÇÃO

                </p>

            </div>

        `;

        modal.classList.remove(
            "hidden"
        );

    }

    catch (error) {

        console.error(error);

    }

};



// ==========================================
// EDITAR MANUTENÇÃO
// ==========================================

window.editarManutencao =
async (id) => {

    try {

        abrirModal(
            "modalManutencao"
        );

        // ==========================
        // BUSCAR DADOS
        // ==========================

        const manutencaoSnap =

            await getDoc(

                doc(
                    db,
                    "manutencoes",
                    id
                )

            );

        if(!manutencaoSnap.exists()){

            alert(
                "Manutenção não encontrada."
            );

            return;

        }

        const dados =
            manutencaoSnap.data();

        // ==========================
        // BUSCAR CAMPOS NOVAMENTE
        // ==========================

        const campoViatura =
            document.getElementById(
                "manutencaoViatura"
            );

        const campoTipo =
            document.getElementById(
                "manutencaoTipo"
            );

        const campoOficina =
            document.getElementById(
                "manutencaoOficina"
            );

        // ==========================
        // VERIFICAR
        // ==========================

        if(!campoViatura){

            console.error(
                "Campo viatura não encontrado."
            );

            return;

        }

        if(!campoTipo){

            console.error(
                "Campo tipo não encontrado."
            );

            return;

        }

        if(!campoOficina){

            console.error(
                "Campo oficina não encontrado."
            );

            return;

        }

        // ==========================
        // PREENCHER
        // ==========================

        campoViatura.value =
            dados.viaturaId || "";

        campoTipo.value =
            dados.tipo || "";

        campoOficina.value =
            dados.oficina || "";

        // ==========================
        // MODO EDIÇÃO
        // ==========================

        window.editandoManutencao =
            id;

    }

    catch(error){

        console.error(
            "Erro ao editar manutenção:",
            error
        );

    }

};

// ==========================================
// FINALIZAR MANUTENÇÃO
// ==========================================

window.finalizarManutencao =
async (
    id,
    viaturaId
) => {

    const confirmar =
        confirm(
            "Finalizar manutenção?"
        );

    if (!confirmar)
        return;

    try {

        // ==========================
        // BUSCAR DADOS ANTES DE APAGAR
        // ==========================

        const manutencaoSnap =
            await getDoc(

                doc(
                    db,
                    "manutencoes",
                    id
                )

            );

        if (!manutencaoSnap.exists()) {

            alert(
                "Manutenção não encontrada."
            );

            return;

        }

        const manutencao =
            manutencaoSnap.data();

        // ==========================
        // DEVOLVER VIATURA
        // ==========================

        await updateDoc(

            doc(
                db,
                "viaturas",
                viaturaId
            ),

            {

                status:
                    "LIVRE"

            }

        );

        // ==========================
        // HISTÓRICO
        // ==========================

        await addDoc(

            collection(
                db,
                "historico"
            ),

            {

                tipo:
                    "manutencao_saida",

                descricao:
                    `Viatura ${manutencao.nomeViatura} saiu da manutenção`,

                viatura:
                    manutencao.nomeViatura || "-",

                servico:
                    manutencao.tipo || "-",

                oficina:
                    manutencao.oficina || "-",

                placa:
                    manutencao.placa || "-",

                status:
                    "FINALIZADA",

                createdAt:
                    serverTimestamp()

            }

        );

        // ==========================
        // REMOVER MANUTENÇÃO
        // ==========================

        await deleteDoc(

            doc(
                db,
                "manutencoes",
                id
            )

        );

        alert(
            "Manutenção finalizada."
        );

    }

    catch (error) {

        console.error(
            error
        );

    }

};



// ==========================================
// HISTÓRICO EM TEMPO REAL
// ==========================================

const historicoRef =
    collection(
        db,
        "historico"
    );

// ==========================================
// OBSERVAÇÕES DO DASHBOARD
// ==========================================

const observacoesDashboardRef =
    collection(
        db,
        "observacoes_dashboard"
    );

// ==========================================
// HISTÓRICO EM TEMPO REAL
// ==========================================
let historicoInicializado = false;

// ==========================================
// HISTÓRICO
// ==========================================

function carregarHistorico() {

    if(historicoInicializado){
        return;
    }

    historicoInicializado = true;

    onSnapshot(

        query(

            historicoRef,

            orderBy(
                "createdAt",
                "desc"
            )

        ),

        (snapshot) => {

            renderHistorico(
                snapshot
            );

        },

        (error) => {

            console.error(
                "Erro histórico:",
                error
            );

        }

    );

}

function renderHistorico(snapshot) {

    const lista =
        document.getElementById(
            "listaHistorico"
        );

    if (!lista) return;

    const historicos = [];

    snapshot.forEach((docItem) => {

        historicos.push({
            id: docItem.id,
            ...docItem.data()
        });

    });

    historicos.sort((a, b) => {

        const dataA =
            a.createdAt?.seconds || 0;

        const dataB =
            b.createdAt?.seconds || 0;

        return dataB - dataA;

    });

    if (historicos.length === 0) {
        lista.innerHTML = `
            <div class="historico-empty">
                Nenhum registro encontrado.
            </div>
        `;
        return;
    }

    const tipoLabels = {
        checklist: "Checklist",
        teatro: "Teatro",
        manutencao: "Manutenção",
        manutencao_saida: "Manutenção",
        avaria: "Avaria"
    };

    const tipoClasses = {
        checklist: "checklist",
        teatro: "teatro",
        manutencao: "manutencao",
        manutencao_saida: "manutencao",
        avaria: "avaria"
    };

    const linhas = historicos.map((item) => {

        const dataHora =
            item.createdAt
            ? item.createdAt
                .toDate()
                .toLocaleString("pt-BR")
            : "Sem data";

        let descricaoCard = item.descricao || "-";

        if (item.tipo === "avaria") {
            descricaoCard = `Ficha de avaria registrada para ${item.viatura || "-"}`;
        }

        const tipo = item.tipo || "registro";
        const tipoLabel = tipoLabels[tipo] || "Registro";
        const tipoClass = tipoClasses[tipo] || "registro";
        const viatura = item.viatura || item.nomeViatura || "-";

        return `
            <tr>
                <td>
                    <span class="historico-badge ${tipoClass}">${tipoLabel}</span>
                </td>
                <td>
                    <div class="historico-resumo">${descricaoCard}</div>
                    <span class="historico-meta">${viatura}</span>
                </td>
                <td>${viatura}</td>
                <td>${dataHora}</td>
                <td>
                    <div class="historico-actions">
                        <button class="btn-details" onclick="verDetalhesHistorico('${item.id}')">Detalhes</button>
                        <button class="btn-delete" onclick="removerHistorico('${item.id}')">Remover</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    lista.innerHTML = `

        <div class="historico-table-container">

            <table class="historico-table">

                <thead>

                    <tr>

                        <th>Tipo</th>

                        <th>Resumo</th>

                        <th>Viatura</th>

                        <th>Data/Hora</th>

                        <th>Ações</th>

                    </tr>

                </thead>

                <tbody>

                    ${linhas}

                </tbody>

            </table>

        </div>

    `;
}

// ======================================
// QUADRO DE INFORMAÇÕES OPERACIONAIS
// ======================================

let observacoesDashboardInicializadas = false;

function iniciarObservacoesDashboard() {

    if (observacoesDashboardInicializadas) {
        return;
    }

    observacoesDashboardInicializadas = true;

    const unsubscribe = onSnapshot(

        observacoesDashboardRef,

        (snapshot) => {

            const observacoes =
                snapshot.docs

                .map((docItem) => ({
                    id: docItem.id,
                    ...docItem.data()
                }))

                .sort((a, b) => {

                    const dataA =
                        obterDataRegistro(a);

                    const dataB =
                        obterDataRegistro(b);

                    return (
                        (dataB?.getTime() || 0) -
                        (dataA?.getTime() || 0)
                    );
                });

            renderObservacoesDashboard(
                observacoes
            );
        },

        (erro) => {

            console.error(
                "Erro ao carregar informações operacionais:",
                erro
            );

            const lista =
                document.getElementById(
                    "listaObservacoes"
                );

            if (lista) {

                lista.innerHTML = `
                    <p class="sem-observacoes">
                        Não foi possível carregar as informações.
                    </p>
                `;
            }
        }
    );

    adicionarListener(unsubscribe);
}


function renderObservacoesDashboard(
    observacoes = []
) {

    const lista =
        document.getElementById(
            "listaObservacoes"
        );

    if (!lista) {
        return;
    }

    lista.innerHTML = "";

    if (!observacoes.length) {

        lista.innerHTML = `
            <p class="sem-observacoes">
                Nenhuma informação cadastrada.
            </p>
        `;

        return;
    }

    observacoes.forEach((observacao) => {

        const item =
            document.createElement("div");

        item.className =
            "observacao-item";

        const conteudo =
            document.createElement("div");

        conteudo.className =
            "observacao-texto";

        const autor =
            document.createElement("strong");

        autor.textContent =
            observacao.autor ||
            "Usuário";

        const texto =
            document.createElement("p");

        texto.textContent =
            observacao.texto || "";

        const data =
            document.createElement("small");

        const dataObservacao =
            obterDataRegistro(observacao);

        data.textContent =
            dataObservacao
                ? dataObservacao.toLocaleString(
                    "pt-BR"
                )
                : "";

        const botao =
            document.createElement("button");

        botao.type =
            "button";

        botao.className =
            "btn-remover-observacao";

        botao.innerHTML =
            '<i class="fa-solid fa-trash"></i>';

        botao.addEventListener(

            "click",

            () => {

                window.removerObservacao(
                    observacao.id
                );

            }

        );

        conteudo.appendChild(autor);
        conteudo.appendChild(texto);
        conteudo.appendChild(data);

        item.appendChild(conteudo);
        item.appendChild(botao);

        lista.appendChild(item);
    });
}

// ======================================
// ADICIONAR INFORMAÇÃO OPERACIONAL
// ======================================

window.adicionarObservacao =
async function(){

    const campo =
        document.getElementById(
            "novaObservacao"
        );

    if(!campo){

        console.error(
            "Campo #novaObservacao não encontrado."
        );

        return;

    }

    const texto =
        campo.value.trim();

    if(!texto){

        alert(
            "Digite uma informação operacional."
        );

        campo.focus();

        return;

    }

    try{

        campo.disabled = true;

        await addDoc(

            observacoesDashboardRef,

            {

                texto,

                autor:
                    auth.currentUser?.email ||
                    "Usuário",

                createdAt:
                    serverTimestamp(),

                dataRegistro:
                    new Date().toISOString()

            }

        );

        campo.value = "";

    }

    catch(erro){

        console.error(
            "Erro ao adicionar informação operacional:",
            erro
        );

        alert(
            "Não foi possível adicionar a informação."
        );

    }

    finally{

        campo.disabled = false;

        campo.focus();

    }

};


// ======================================
// REMOVER UMA INFORMAÇÃO
// ======================================

window.removerObservacao =
async function(id){

    if(!id){

        return;

    }

    const confirmar =
        confirm(
            "Remover esta informação operacional?"
        );

    if(!confirmar){

        return;

    }

    try{

        await deleteDoc(

            doc(

                db,

                "observacoes_dashboard",

                id

            )

        );

    }

    catch(erro){

        console.error(
            "Erro ao remover informação operacional:",
            erro
        );

        alert(
            "Não foi possível remover a informação."
        );

    }

};


// ======================================
// LIMPAR TODO O QUADRO
// ======================================

window.limparObservacoes =
async function(){

    const confirmar =
        confirm(
            "Apagar todas as informações operacionais?"
        );

    if(!confirmar){

        return;

    }

    try{

        const snapshot =
            await getDocs(
                observacoesDashboardRef
            );

        if(snapshot.empty){

            alert(
                "Não existem informações para remover."
            );

            return;

        }

        const exclusoes =
            snapshot.docs.map(

                docItem =>

                    deleteDoc(
                        docItem.ref
                    )

            );

        await Promise.all(
            exclusoes
        );

        alert(
            "Quadro de informações limpo."
        );

    }

    catch(erro){

        console.error(
            "Erro ao limpar informações operacionais:",
            erro
        );

        alert(
            "Não foi possível limpar o quadro."
        );

    }

};

window.verDetalhesHistorico =
async (id) => {

    const modal =
        document.getElementById(
            "modalDetalhes"
        );

    const conteudo =
        document.getElementById(
            "detalhesConteudo"
        );

    const registro =
        await getDoc(

            doc(
                db,
                "historico",
                id
            )

        );

    if (
        !registro.exists()
    ) return;

    const dados =
        registro.data();

    // ==========================================
    // BUSCAR NOMES DOS INTEGRANTES
    // ==========================================

    async function buscarNomeMotorista(id){

        if(!id) return "-";

        try{

            const snap = await getDoc(
                doc(db,"motoristas",id)
            );

            if(snap.exists()){

                const m = snap.data();

                return `${m.graduacao} ${m.nome}`;

            }

        }catch(e){

            console.error(e);

        }

        return "-";

    }

    const motoristaNome =

        dados.motoristaNome ||

        await buscarNomeMotorista(
            dados.motorista
        );

    const comandanteNome =

        dados.comandanteNome ||

        await buscarNomeMotorista(
            dados.comandante
        );

    const p1Nome =

        dados.p1Nome ||

        await buscarNomeMotorista(
            dados.p1
        );

    const p2Nome =

        dados.p2Nome ||

        await buscarNomeMotorista(
            dados.p2
        );

    const dataHora =
        dados.createdAt
        ? dados.createdAt
            .toDate()
            .toLocaleString(
                "pt-BR"
            )
        : "-";

    // ==================================
    // CHECKLIST
    // ==================================

    if (
        dados.tipo ===
        "checklist"
    ) {

        conteudo.innerHTML = `

            <div class="detalhes-box">

                <h2>
                    Checklist
                </h2>

                <p>
                    <strong>Viatura:</strong>
                    ${dados.viatura || "-"}
                </p>

                <p>
                    <strong>Placa:</strong>
                    ${dados.placa || "-"}
                </p>

                <p>
                    <strong>Motorista:</strong>
                    ${motoristaNome || "-"}
                </p>

                <p>
                    <strong>Serviço:</strong>
                    ${dados.servico || "-"}
                </p>

                <p>
                    <strong>Avarias:</strong>
                    ${dados.avarias || "Nenhuma"}
                </p>

                <p>
                    <strong>Data:</strong>
                    ${dataHora}
                </p>

            </div>

        `;
    }

    // ==================================
    // TEATRO DE OPERAÇÕES
    // ==================================

    else if (
        dados.tipo ===
        "teatro"
    ) {

        conteudo.innerHTML = `

            <div class="detalhes-box">

                <h2>
                    Teatro de Operações
                </h2>

                <p>
                    <strong>Viatura:</strong>
                    ${dados.viatura || "-"}
                </p>

                <p>
                    <strong>Placa:</strong>
                    ${dados.placa || "-"}
                </p>

                <p>
                    <strong>Motorista:</strong>
                    ${dados.motoristaNome || dados.motorista || "-"}
                </p>

                <p>
                    <strong>Comandante:</strong>
                    ${dados.comandanteNome || dados.comandante || "-"}
                </p>

                <p>
                    <strong>P1:</strong>
                    ${dados.p1Nome || dados.p1 || "-"}
                </p>

                <p>
                    <strong>P2:</strong>
                    ${dados.p2Nome || dados.p2 || "-"}
                </p>

                <p>
                    <strong>Serviço:</strong>
                    ${dados.servico || "-"}
                </p>

                <p>
                    <strong>Área:</strong>
                    ${dados.area || "-"}
                </p>

                

                <p>
                    <strong>Contato:</strong>
                    ${dados.contato || "-"}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${dados.status || "-"}
                </p>

                <p>
                    <strong>KM Percorrido:</strong>
                    ${dados.kmPercorrido || 0} km
                </p>

                <p>
                    <strong>Data:</strong>
                    ${dataHora}
                </p>

            </div>

        `;
    }

        // ==================================
        // MANUTENÇÃO
        // ==================================

        else if (

            dados.tipo === "manutencao"

            ||

            dados.tipo === "manutencao_saida"

        ) {

            conteudo.innerHTML = `

                <div class="detalhes-box">

                    <h2>Manutenção</h2>

                    <p>
                        <strong>Viatura:</strong>
                        ${dados.viatura || "-"}
                    </p>

                    <p>
                        <strong>Serviço:</strong>
                        ${dados.servico || "-"}
                    </p>

                    <p>
                        <strong>Oficina:</strong>
                        ${dados.oficina || "-"}
                    </p>

                    <p>
                        <strong>Descrição:</strong>
                        ${dados.descricao || "-"}
                    </p>

                    <p>
                        <strong>Data:</strong>
                        ${dataHora}
                    </p>

                </div>

            `;

        }

        // ==================================
        // AVARIA
        // ==================================

       else if (

            dados.tipo === "avaria"

        ) {

            conteudo.innerHTML = `

                <div class="detalhes-box">

                    <h2>
                        Ficha de Avaria
                    </h2>

                    <p>
                        <strong>Nº Ficha:</strong>
                        ${dados.numeroFicha || "-"}
                    </p>

                    <p>
                        <strong>Viatura:</strong>
                        ${dados.viatura || "-"}
                    </p>

                    <p>
                        <strong>Placa:</strong>
                        ${dados.placa || "-"}
                    </p>

                    <p>
                        <strong>Modelo:</strong>
                        ${dados.modelo || "-"}
                    </p>

                    <p>
                        <strong>KM:</strong>
                        ${dados.km || "-"}
                    </p>

                    <p>
                        <strong>Condutor:</strong>
                        ${dados.condutor || "-"}
                    </p>

                    <p>
                        <strong>Matrícula:</strong>
                        ${dados.matricula || "-"}
                    </p>

                    <p>
                        <strong>Local:</strong>
                        ${dados.local || "-"}
                    </p>

                    <p>
                        <strong>Descrição:</strong>
                        ${dados.descricao || "-"}
                    </p>

                    <p>
                        <strong>Data:</strong>
                        ${dataHora}
                    </p>

                    <p>
                        <strong>Bairro:</strong>
                        ${dados.bairro || "-"}
                    </p>

                    <p>
                        <strong>Cidade:</strong>
                        ${dados.cidade || "-"}
                    </p>

                    <p>
                        <strong>Estado:</strong>
                        ${dados.estado || "-"}
                    </p>

                    <p>
                        <strong>Observações:</strong>
                        ${dados.observacoes || "-"}
                    </p>

                </div>

            `;

        }

    modal.classList.remove(
        "hidden"
    );
    

};

window.detalhesBaixa =
async function(id){

    const registro =
        await getDoc(

            doc(
                db,
                "viaturas",
                id
            )

        );

    if(!registro.exists()) return;

    const dados =
        registro.data();

    document.getElementById(
        "detalhesConteudo"
    ).innerHTML = `

        <div class="detalhes-box">

            <h2>
                Detalhe da Baixa
            </h2>

            <p>

                <strong>Viatura:</strong>

                ${dados.nome || "-"}

            </p>

            <p>

                <strong>Motivo:</strong>

                ${dados.motivoBaixa || "-"}

            </p>

        </div>

    `;

    document
        .getElementById(
            "modalDetalhes"
        )
        .classList
        .remove("hidden");

};

window.mostrarChecklistHoje =
async function(){

    const snapshot = await getDocs(
        collection(db, "checklists")
    );

    const hoje = new Date();

    const lista = [];

    snapshot.forEach(docItem => {

        const dados = docItem.data();
        const dataChecklist = converterParaData(dados.createdAt);

        if (!dataChecklist) {
            return;
        }

        const mesmoDia =
            dataChecklist.getDate() === hoje.getDate() &&
            dataChecklist.getMonth() === hoje.getMonth() &&
            dataChecklist.getFullYear() === hoje.getFullYear();

        if (mesmoDia) {

            lista.push(
                `${dados.motorista || "-"} - ${dados.nomeViatura || dados.viaturaId || "-"}`
            );

        }

    });

    lista.sort((a, b) => b.localeCompare(a));

    abrirDashboardModal(
        "Checklists Realizados Hoje",
        lista
    );

};

window.filtrarHistorico =
async () => {

    const tipo =
        document.getElementById(
            "filtroTipo"
        )?.value;

    const dataInicio =
        document.getElementById(
            "filtroDataInicio"
        )?.value;

    const dataFim =
        document.getElementById(
            "filtroDataFim"
        )?.value;

        const filtroViatura =
        document.getElementById(
            "filtroViatura"
        )?.value
        ?.toLowerCase()
        ?.trim();

    try {

        let q =
            historicoRef;

        // ==========================
        // FILTRO POR TIPO
        // ==========================

        // ==========================================
// FILTRO POR TIPO
// ==========================================

        if (

            tipo

            &&

            tipo !== "manutencao"

        ) {

            q = query(

                historicoRef,

                where(
                    "tipo",
                    "==",
                    tipo
                )

            );

        }

        const snapshot =
            await getDocs(q);

        // ==========================
        // FILTRAR POR DATA
        // ==========================

        const docsFiltrados = [];

        snapshot.forEach(
            (docItem) => {

            const dados =
                docItem.data();

            let incluir =
                true;


                // ==================================
                // MANUTENÇÃO + MANUTENÇÃO FINALIZADA
                // ==================================

                if (tipo === "manutencao") {

                    if (

                        dados.tipo !== "manutencao"

                        &&

                        dados.tipo !== "manutencao_saida"

                    ) {

                        incluir = false;

                    }

                }

              // ==================================
                // FILTRO VIATURA
                // ==================================

                if(filtroViatura){

                    const nomeViatura =
                        (
                            dados.viatura || ""
                        )
                        .toLowerCase();

                    if(

                        !nomeViatura.includes(
                            filtroViatura
                        )

                    ){

                        incluir = false;

                    }

                }

            // ==================================
            // FILTRO POR INTERVALO DE DATAS
            // ==================================

            if (dataInicio || dataFim) {

                if (!dados.createdAt) {

                    incluir = false;

                } else {

                    const dataRegistro =

                        dados.createdAt
                        .toDate()
                        .toISOString()
                        .split("T")[0];

                    // Data inicial

                    if (
                        dataInicio &&
                        dataRegistro < dataInicio
                    ) {

                        incluir = false;

                    }

                    // Data final

                    if (
                        dataFim &&
                        dataRegistro > dataFim
                    ) {

                        incluir = false;

                    }

                }

            }

            if (incluir) {

                docsFiltrados.push({

                    id:
                        docItem.id,

                    data:
                        () => dados

                });

            }

        });

        // ==========================
        // RENDER NORMAL
        // ==========================

        renderHistorico({

            forEach: (callback) => {

                docsFiltrados.forEach(
                    callback
                );

            }

        });

    }

    catch (error) {

        console.error(

            "Erro ao filtrar:",

            error

        );

    }

};

window.removerHistorico =
async (id) => {

    const confirmar =
        confirm(
            "Deseja remover este registro?"
        );

    if (!confirmar)
        return;

    try {

        await deleteDoc(

            doc(
                db,
                "historico",
                id
            )

        );

        alert(
            "Registro removido."
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Erro ao remover."
        );

    }

};


window.removerHistoricoFiltrado =
async () => {

    const tipo =
        document.getElementById(
            "filtroTipo"
        )?.value;

    if (!tipo) {

        alert(
            "Selecione um filtro."
        );

        return;
    }

    const confirmar =
        confirm(
            `Remover todos os registros do tipo ${tipo}?`
        );

    if (!confirmar)
        return;

    try {

        const q =
            query(

                historicoRef,

                where(
                    "tipo",
                    "==",
                    tipo
                )

            );

        const snapshot =
            await getDocs(q);

        const promessas = [];

        snapshot.forEach(
            (docItem) => {

            promessas.push(

                deleteDoc(

                    doc(
                        db,
                        "historico",
                        docItem.id
                    )

                )

            );

        });

        await Promise.all(
            promessas
        );

        alert(
            "Registros removidos."
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Erro ao remover registros."
        );

    }

};

// ==========================================
// INICIAR HISTÓRICO
// ==========================================



// ======================================
// PARTE 7.1 — DASHBOARD INTELIGENTE
// TEMPO REAL + ANALYTICS OPERACIONAL
// ======================================


// ======================================
// DASHBOARD INTELIGENTE
// ======================================

// ======================================
// DASHBOARD INTELIGENTE CORRIGIDO
// ======================================

let dashboardInicializado = false;

function iniciarDashboardInteligente() {

    if (dashboardInicializado) {
        return;
    }

    dashboardInicializado = true;

    monitorarChecklistsDashboard();
    monitorarOperacoesDashboard();
    monitorarUltimaAtividadeDashboard();
}


// ======================================
// CONVERTER QUALQUER DATA DO FIRESTORE
// ======================================

function obterDataRegistro(dados = {}) {

    const valor =
        dados.createdAt ||
        dados.dataChecklist ||
        dados.dataHora ||
        dados.data ||
        dados.timestamp ||
        dados.updatedAt;

    return converterParaData(valor);
}


// ======================================
// VERIFICAR SE A DATA É DE HOJE
// ======================================

function dataEhHoje(data) {

    if (!(data instanceof Date)) {
        return false;
    }

    if (Number.isNaN(data.getTime())) {
        return false;
    }

    const hoje = new Date();

    return (
        data.getFullYear() === hoje.getFullYear() &&
        data.getMonth() === hoje.getMonth() &&
        data.getDate() === hoje.getDate()
    );
}


// ======================================
// CHECKLISTS DO DIA
// ======================================

function monitorarChecklistsDashboard() {

    const unsubscribe = onSnapshot(

        collection(
            db,
            "checklists"
        ),

        (snapshot) => {

            cache.checklists =
                snapshot.docs.map((docItem) => ({
                    id: docItem.id,
                    ...docItem.data()
                }));

            const totalHoje =
                cache.checklists.filter((checklist) => {

                    const data =
                        obterDataRegistro(checklist);

                    return dataEhHoje(data);

                }).length;

            atualizarElemento(
                "totalChecklistHoje",
                totalHoje
            );

        },

        (erro) => {

            console.error(
                "Erro ao carregar checklists do Dashboard:",
                erro
            );

            atualizarElemento(
                "totalChecklistHoje",
                0
            );
        }
    );

    adicionarListener(unsubscribe);
}


// ======================================
// OPERAÇÕES E VIATURAS EM OPERAÇÃO
// ======================================

function monitorarOperacoesDashboard() {

    const unsubscribe = onSnapshot(

        collection(
            db,
            "teatro_operacoes"
        ),

        (snapshot) => {

            const operacoesAtivas =
                snapshot.docs

                .map((docItem) => ({
                    id: docItem.id,
                    ...docItem.data()
                }))

                .filter((operacao) => {

                    const status =
                        String(
                            operacao.status || ""
                        )
                        .trim()
                        .toUpperCase();

                    return (
                        status === "ATIVA" ||
                        status === "ATIVO" ||
                        status === "EM OPERAÇÃO" ||
                        status === "EM OPERACAO"
                    );
                });

            cache.operacoes =
                operacoesAtivas;

            atualizarElemento(
                "totalOperacoes",
                operacoesAtivas.length
            );

            renderizarViaturasEmOperacao(
                operacoesAtivas
            );

        },

        (erro) => {

            console.error(
                "Erro ao carregar operações do Dashboard:",
                erro
            );

            atualizarElemento(
                "totalOperacoes",
                0
            );

            renderizarViaturasEmOperacao([]);
        }
    );

    adicionarListener(unsubscribe);
}


// ======================================
// RENDERIZAR VIATURAS EM OPERAÇÃO
// ======================================

function renderizarViaturasEmOperacao(
    operacoes = []
) {

    const container =
        document.getElementById(
            "viaturasOperacao"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!operacoes.length) {

        container.innerHTML = `
            <p class="sem-registros">
                Nenhuma viatura em operação.
            </p>
        `;

        return;
    }

    operacoes.forEach((operacao) => {

        const card =
            document.createElement("div");

        card.className =
            "operacao-card";

        const nome =
            document.createElement("strong");

        nome.textContent =
            operacao.nomeViatura ||
            operacao.viatura ||
            "Viatura não informada";

        const placa =
            document.createElement("p");

        placa.textContent =
            `Placa: ${operacao.placa || "-"}`;

        const motorista =
            document.createElement("p");

        motorista.textContent =
            `Motorista: ${
                operacao.motoristaNome ||
                operacao.motorista ||
                "-"
            }`;

        const area =
            document.createElement("p");

        area.textContent =
            `Área: ${operacao.area || "-"}`;

        card.appendChild(nome);
        card.appendChild(placa);
        card.appendChild(motorista);
        card.appendChild(area);

        container.appendChild(card);
    });
}


// ======================================
// ÚLTIMAS ATIVIDADES
// ======================================

function monitorarUltimaAtividadeDashboard() {

    const unsubscribe = onSnapshot(

        collection(
            db,
            "historico"
        ),

        (snapshot) => {

            const registros =
                snapshot.docs

                .map((docItem) => ({
                    id: docItem.id,
                    ...docItem.data()
                }))

                .sort((a, b) => {

                    const dataA =
                        obterDataRegistro(a);

                    const dataB =
                        obterDataRegistro(b);

                    return (
                        (dataB?.getTime() || 0) -
                        (dataA?.getTime() || 0)
                    );
                });

            renderizarUltimasAtividades(
                registros.slice(0, 5)
            );

        },

        (erro) => {

            console.error(
                "Erro ao carregar últimas atividades:",
                erro
            );

            renderizarUltimasAtividades([]);
        }
    );

    adicionarListener(unsubscribe);
}


// ======================================
// RENDERIZAR ÚLTIMAS ATIVIDADES
// ======================================

function renderizarUltimasAtividades(
    registros = []
) {

    const container =
        document.getElementById(
            "ultimaAtividade"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!registros.length) {

        container.innerHTML = `
            <p class="sem-registros">
                Nenhuma atividade registrada.
            </p>
        `;

        return;
    }

    registros.forEach((registro) => {

        const item =
            document.createElement("div");

        item.className =
            "atividade-item";

        const titulo =
            document.createElement("strong");

        titulo.textContent =
            formatarTipoAtividade(
                registro.tipo
            );

        const descricao =
            document.createElement("p");

        descricao.textContent =
            registro.descricao ||
            "Atividade registrada no sistema.";

        const data =
            document.createElement("small");

        const dataRegistro =
            obterDataRegistro(registro);

        data.textContent =
            dataRegistro
                ? dataRegistro.toLocaleString(
                    "pt-BR"
                )
                : "Data não informada";

        item.appendChild(titulo);
        item.appendChild(descricao);
        item.appendChild(data);

        container.appendChild(item);
    });
}


// ======================================
// FORMATAR TIPO DO HISTÓRICO
// ======================================

function formatarTipoAtividade(tipo) {

    const tipos = {
        checklist: "Checklist",
        teatro: "Teatro de Operações",
        manutencao: "Entrada em Manutenção",
        manutencao_saida: "Saída da Manutenção",
        avaria: "Ficha de Avaria"
    };

    return (
        tipos[tipo] ||
        tipo ||
        "Registro operacional"
    );
}

// ======================================
// HELPERS
// ======================================

function atualizarElemento(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.innerText =
            valor;

    }

}

function converterParaData(valor) {

    if (!valor) {
        return null;
    }

    if (valor.toDate) {
        try {
            return valor.toDate();
        } catch (error) {
            return null;
        }
    }

    if (valor instanceof Date) {
        return valor;
    }

    if (typeof valor === "string") {
        const data = new Date(valor);
        return isNaN(data.getTime()) ? null : data;
    }

    if (typeof valor === "number") {
        const data = new Date(valor);
        return isNaN(data.getTime()) ? null : data;
    }

    return null;

}

function normalizarStatusViatura(status) {

    const valor = String(status || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();

    if (["LIVRE", "DISPONIVEL", "DISPONÍVEL"].includes(valor)) {
        return "LIVRE";
    }

    if (["EM USO", "EM_USO", "USO", "EM OPERACAO", "EM OPERAÇÃO"].includes(valor)) {
        return "EM USO";
    }

    if (["MANUTENCAO", "MANUTENÇÃO", "EM MANUTENCAO", "EM MANUTENÇÃO"].includes(valor)) {
        return "MANUTENCAO";
    }

    if (["BAIXADA", "BAIXADO", "BAIXA", "INATIVA"].includes(valor)) {
        return "BAIXADA";
    }

    return "OUTRO";

}

function getStatusClass(
    status
) {

    switch (
        normalizarStatusViatura(status)
    ) {

        case "LIVRE":
            return "status-livre";

        case "EM USO":
            return "status-uso";

        case "MANUTENCAO":
            return "status-manutencao";

        case "BAIXADA":
            return "status-baixada";

        default:
            return "";

    }

}


// ======================================
// INICIAR DASHBOARD
// ======================================



window.filtrarMotoristas =
function () {

    const busca =
        document
        .getElementById(
            "buscarMatricula"
        )
        ?.value
        .toLowerCase()
        .trim();

    const cards =
        document.querySelectorAll(
            "#listaMotoristas .viatura-card"
        );

    cards.forEach((card) => {

        const texto =
            card.innerText
            .toLowerCase();

        const mostrar =
            texto.includes(
                busca
            );

        card.style.display =
            mostrar
            ? "block"
            : "none";

    });

};

// ========================================
// MODAL DASHBOARD
// ========================================

function abrirDashboardModal(
    titulo,
    lista
){

    const tituloModal =
        document.getElementById(
            "tituloDashboardModal"
        );

    const conteudo =
        document.getElementById(
            "conteudoDashboardModal"
        );

    tituloModal.innerText =
        titulo;

    if(lista.length === 0){

        conteudo.innerHTML =
            "<p>Nenhum registro encontrado.</p>";

    }else{

        conteudo.innerHTML =
            lista
            .map(item =>
                `<p>• ${item}</p>`
            )
            .join("");

    }

    abrirModal(
        "modalDashboard"
    );

}

window.mostrarViaturasLivres =
function(){

    const lista =

        cache.viaturas

        .filter(v =>
            normalizarStatusViatura(v.status) === "LIVRE"
        )

        .map(v =>
            `${v.nome} (${v.placa})`
        );

    abrirDashboardModal(

        "Viaturas Livres",

        lista

    );

};

window.mostrarViaturasEmUso =
function(){

    const lista =

        cache.viaturas

        .filter(v =>
            normalizarStatusViatura(v.status) === "EM USO"
        )

        .map(v =>
            `${v.nome} (${v.placa})`
        );

    abrirDashboardModal(

        "Viaturas em Uso",

        lista

    );

};

window.mostrarViaturasManutencao =
function(){

    const lista =

        cache.viaturas

        .filter(v =>
            normalizarStatusViatura(v.status) === "MANUTENCAO"
        )

        .map(v =>
            `${v.nome} (${v.placa})`
        );

    abrirDashboardModal(

        "Viaturas em Manutenção",

        lista

    );

};

window.mostrarViaturasBaixadas = function () {

    const baixadas = cache.viaturas.filter(

        v => normalizarStatusViatura(v.status) === "BAIXADA"

    );

    document.getElementById(
        "tituloDashboardModal"
    ).innerText = "Viaturas Baixadas";

    const conteudo =
        document.getElementById(
            "conteudoDashboardModal"
        );

    if (!baixadas.length) {

        conteudo.innerHTML = `

            <p class="texto-centralizado">

                Nenhuma viatura baixada.

            </p>

        `;

        abrirModal("modalDashboard");

        return;

    }

    let html = "";

    baixadas.forEach(v => {

        html += `

            <div class="dashboard-item">

                <strong>

                    <i class="fa-solid fa-ban"></i>

                    ${v.nome}

                </strong>

                <br>

                Placa: ${v.placa}

            </div>

        `;

    });

    conteudo.innerHTML = html;

    abrirModal("modalDashboard");

};

window.salvarFichaAvaria =
async function(){

    

    try{

        const numeroFicha =
            await gerarNumeroFicha();

        const viaturaSelect =
            document.getElementById(
                "avariaViatura"
            );

        const viatura =
            viaturaSelect.options[
                viaturaSelect.selectedIndex
            ]?.text || "";

        const viaturaId =
            viaturaSelect.value;

        const placa =
            document.getElementById(
                "avariaPlaca"
            )?.value || "";

        const modelo =
            document.getElementById(
                "avariaModelo"
            )?.value || "";

        const km =
            document.getElementById(
                "avariaKm"
            )?.value || "";

        const condutor =
            document.getElementById(
                "avariaCondutor"
            )?.value || "";

        const matricula =
            document.getElementById(
                "avariaMatricula"
            )?.value || "";

        const data =
            document.getElementById(
                "avariaData"
            )?.value || "";

        const hora =
            document.getElementById(
                "avariaHora"
            )?.value || "";

        const local =
            document.getElementById(
                "avariaLocal"
            )?.value || "";

        const bairro =
            document.getElementById(
                "avariaBairro"
            )?.value || "";

        const cidade =
            document.getElementById(
                "avariaCidade"
            )?.value || "";

        const estado =
            document.getElementById(
                "avariaEstado"
            )?.value || "";

        const descricao =
            document.getElementById(
                "avariaDescricao"
            )?.value || "";

        const observacoes =
            document.getElementById(
                "observacoesAvaria"
            )?.value || "";

        // =====================
        // SALVA FICHA COMPLETA
        // =====================

        await addDoc(

            fichasAvariaRef,

            {

                numeroFicha,

                viaturaId,
                viatura,

                placa,
                modelo,
                km,

                condutor,
                matricula,

                data,
                hora,

                local,
                bairro,
                cidade,
                estado,

                descricao,
                observacoes,

                createdAt:
                    serverTimestamp()

            }

        );

        // =====================
        // HISTÓRICO
        // =====================

        await addDoc(

            collection(
                db,
                "historico"
            ),

            {

                tipo:
                    "avaria",

                numeroFicha,

                descricao,

                viatura,
                placa,

                modelo,
                km,

                condutor,
                matricula,

                local,
                cidade,
                estado,

                observacoes,

                createdAt:
                    serverTimestamp()

            }

        );

        alert(
            `Ficha ${numeroFicha} salva com sucesso.`
        );
        await gerarPdfAvaria();

    }

    catch(error){

        console.error(error);

        alert(
            "Erro ao salvar ficha."
        );

    }

};

let marcacoesFrente = [];
let marcacoesTraseira = [];

function criarMarcador(
    container,
    x,
    y,
    tipo
){

    const marcador =
        document.createElement("div");

    marcador.className =
        "marcador-avaria";

    marcador.style.left =
        x + "px";

    marcador.style.top =
        y + "px";

    marcador.dataset.x = x;

    marcador.dataset.y = y;

    marcador.addEventListener(

        "click",

        (e)=>{

            e.stopPropagation();

            if(
                tipo === "frente"
            ){

                marcacoesFrente =
                    marcacoesFrente.filter(

                        item =>

                            !(
                                item.x == x
                                &&
                                item.y == y
                            )

                    );

            }else{

                marcacoesTraseira =
                    marcacoesTraseira.filter(

                        item =>

                            !(
                                item.x == x
                                &&
                                item.y == y
                            )

                    );

            }

            marcador.remove();

        }

    );

    container.appendChild(
        marcador
    );

}

function iniciarCroqui(){

    const frente =
        document.getElementById(
            "croquiFrente"
        );

    const traseira =
        document.getElementById(
            "croquiTraseira"
        );

    if(!frente || !traseira){
        return;
    }

    frente.onclick = (e)=>{

        const x =
            e.offsetX;

        const y =
            e.offsetY;

        marcacoesFrente.push({
            x,y
        });

        criarMarcador(
            frente.parentElement,
            x,
            y,
            "frente"
        );

    };

    traseira.onclick = (e)=>{

        const x =
            e.offsetX;

        const y =
            e.offsetY;

        marcacoesTraseira.push({
            x,y
        });

        criarMarcador(
            traseira.parentElement,
            x,
            y,
            "traseira"
        );

    };

}

window.gerarPdfAvaria =
async function(){

    const numeroFicha =
        await gerarNumeroFicha();

    const { jsPDF } =
        window.jspdf;

    const pdf =
        new jsPDF(

            "p",
            "mm",
            "a4"

        );

    // ==================================
    // DADOS
    // ==================================

    const viatura =

        document.getElementById(
            "avariaViatura"
        );

    const placa =
        document.getElementById(
            "avariaPlaca"
        )?.value || "";

    const modelo =
        document.getElementById(
            "avariaModelo"
        )?.value || "";

    const km =
        document.getElementById(
            "avariaKm"
        )?.value || "";

    const condutor =
        document.getElementById(
            "avariaCondutor"
        )?.value || "";

    const matricula =
        document.getElementById(
            "avariaMatricula"
        )?.value || "";

    const data =
        document.getElementById(
            "avariaData"
        )?.value || "";

    const hora =
        document.getElementById(
            "avariaHora"
        )?.value || "";

    const local =
        document.getElementById(
            "avariaLocal"
        )?.value || "";

    const descricao =
        document.getElementById(
            "avariaDescricao"
        )?.value || "";

    const bairro =
    document.getElementById(
        "avariaBairro"
    )?.value || "";

    const cidade =
        document.getElementById(
            "avariaCidade"
        )?.value || "";

    const estado =
        document.getElementById(
            "avariaEstado"
        )?.value || "";

    const tipoAcidente =
        document.getElementById(
            "tipoAcidente"
        )?.value || "";

    const condicaoPista =
        document.getElementById(
            "condicaoPista"
        )?.value || "";

    const tipoPista =
        document.getElementById(
            "tipoPista"
        )?.value || "";

    const observacoes =
        document.getElementById(
            "observacoesAvaria"
        )?.value || "";

    const terceiroNome =
    document.getElementById(
        "terceiroNome"
    )?.value || "";

    const terceiroTelefone =
        document.getElementById(
            "terceiroTelefone"
        )?.value || "";

    const terceiroEndereco =
        document.getElementById(
            "terceiroEndereco"
        )?.value || "";

    const terceiroCidade =
        document.getElementById(
            "terceiroCidade"
        )?.value || "";

    const terceiroEstado =
        document.getElementById(
            "terceiroEstado"
        )?.value || "";

    const terceiroPlaca =
        document.getElementById(
            "terceiroPlaca"
        )?.value || "";

    const terceiroModelo =
        document.getElementById(
            "terceiroModelo"
        )?.value || "";

    // ==================================
    // CABEÇALHO PREMIUM
    // ==================================

    pdf.setFillColor(
        107,
        91,
        62
    );

    pdf.rect(
        0,
        0,
        210,
        32,
        "F"
    );

    // Relatório demonstrativo sem brasão institucional.

    pdf.setTextColor(
        255,
        255,
        255
    );

    pdf.setFontSize(20);

    pdf.text(

        "FROTA DEMO",

        105,

        14,

        {

            align:"center"

        }

    );

    pdf.setFontSize(10);

    pdf.text(

        "Ambiente demonstrativo - dados fictícios",

        105,

        22,

        {

            align:"center"

        }

    );

    pdf.setFontSize(12);

    pdf.text(

        "FICHA DE AVARIA DE VIATURA",

        105,

        28,

        {

            align:"center"

        }

    );

    pdf.setFontSize(10);

    pdf.text(

        `Nº ${numeroFicha}`,

        190,

        15,

        {

            align:"right"

        }

    );
    // ==================================
    // DADOS DA VIATURA
    // ==================================

    pdf.autoTable({

        theme:"grid",

        styles:{
            fontSize:9
        },

        headStyles:{
            fillColor:[107,91,62]
        },

        startY:35,

        head:[

            [

                "VIATURA",
                "PLACA",
                "MODELO",
                "KM"

            ]

        ],

        body:[

            [

                viatura.options[
                    viatura.selectedIndex
                ]?.text || "",

                placa,

                modelo,

                km

            ]

        ]

    });

    // ==================================
    // CONDUTOR
    // ==================================

    pdf.autoTable({

        theme:"grid",

        styles:{
            fontSize:9
        },

        headStyles:{
            fillColor:[107,91,62]
        },

        startY:
            pdf.lastAutoTable.finalY + 5,

        head:[

            [

                "CONDUTOR",
                "MATRÍCULA",
                "DATA",
                "HORA"

            ]

        ],

        body:[

            [

                condutor,
                matricula,
                data,
                hora

            ]

        ]

    });

        pdf.autoTable({

        startY:
            pdf.lastAutoTable.finalY + 5,

        head:[

            [

                "TERCEIRO",

                "TELEFONE",

                "PLACA",

                "MODELO"

            ]

        ],

        body:[

            [

                terceiroNome,

                terceiroTelefone,

                terceiroPlaca,

                terceiroModelo

            ]

        ]

    });

    // ==================================
    // LOCAL
    // ==================================

    pdf.autoTable({

        theme:"grid",

        styles:{
            fontSize:9
        },

        headStyles:{
            fillColor:[107,91,62]
        },

        startY:
            pdf.lastAutoTable.finalY + 5,

        head:[

            [

                "LOCAL DA AVARIA"

            ]

            

        ],

        

        

        body:[

            [

                local

            ]

        ]

    });

    pdf.autoTable({

        startY:
            pdf.lastAutoTable.finalY + 5,

        theme:"grid",

        head:[

            [

                "TIPO ACIDENTE",

                "CONDIÇÃO PISTA",

                "TIPO PISTA"

            ]

        ],

        body:[

            [

                tipoAcidente,

                condicaoPista,

                tipoPista

            ]

        ]

    });


    pdf.autoTable({

        startY:
            pdf.lastAutoTable.finalY + 5,

            

        theme:"grid",

        head:[

            [

                "BAIRRO",

                "CIDADE",

                "ESTADO"

            ]

        ],

        body:[

            [

                bairro,

                cidade,

                estado

            ]

        ]

    });
    
    pdf.setTextColor(
        0,
        0,
        0
    );

    // ==================================
    // DESCRIÇÃO
    // ==================================

    // ==================================
    // DESCRIÇÃO
    // ==================================

    const yDescricao =

        pdf.lastAutoTable.finalY + 10;

    pdf.setFontSize(12);

    pdf.setTextColor(0,0,0);

    pdf.text(

        "DESCRIÇÃO DA OCORRÊNCIA",

        14,

        yDescricao

    );

    pdf.roundedRect(

        14,

        yDescricao + 3,

        182,

        45,

        3,

        3

    );

    pdf.setFontSize(10);

    pdf.setTextColor(
        0,
        0,
        0
    );

    const textoDescricao =

        pdf.splitTextToSize(

            descricao || "SEM DESCRIÇÃO",

            165

        );

    pdf.text(

        textoDescricao,

        18,

        yDescricao + 12

    );

    // ==================================
    // NOVA PÁGINA
    // ==================================

    pdf.addPage();

    pdf.setTextColor(
        0,
        0,
        0
    );

    pdf.setFontSize(16);

    pdf.text(

        "ÁREA ATINGIDA DA VIATURA",

        105,

        20,

        {

            align:"center"

        }

    );

    // ==================================
    // CROQUI
    // ==================================

    const frente =
    new Image();

        frente.src =
            "assets/croqui-s10-frente.png";

        await new Promise(
            resolve => {
                frente.onload =
                    resolve;
            }
        );

        pdf.addImage(

            frente,

            "PNG",

            15,

            30,

            180,

            70

        );

        marcacoesFrente.forEach(

            ponto => {

                pdf.setFillColor(
                    255,
                    0,
                    0
                );

                pdf.circle(

                    15 + (ponto.x * 180 / 420),

                    30 + (ponto.y * 70 / 220),

                    2,

                    "F"

                );

            }

        );

    const traseira =
    new Image();

        traseira.src =
            "assets/croqui-s10-traseira-sem-fundo.png";

        await new Promise(
            resolve => {
                traseira.onload =
                    resolve;
            }
        );

        pdf.addImage(

            traseira,

            "PNG",

            15,

            110,

            180,

            70

        );
        marcacoesTraseira.forEach(

            ponto => {

                pdf.setFillColor(
                    255,
                    0,
                    0
                );

                pdf.circle(

                    15 + (ponto.x * 180 / 420),

                    110 + (ponto.y * 70 / 220),

                    2,

                    "F"

                );

            }

        );

    // ==================================
    // OBSERVAÇÕES
    // ==================================

    pdf.setFontSize(14);

    pdf.text(
        "OBSERVAÇÕES",
        14,
        195
    );

    pdf.roundedRect(
        14,
        200,
        182,
        28,
        3,
        3
    );

    pdf.setTextColor(0,0,0);

    pdf.setFontSize(10);

    pdf.setTextColor(
        0,
        0,
        0
    );

    const textoObs =

        pdf.splitTextToSize(

            observacoes || "SEM OBSERVAÇÕES",

            165

        );

    pdf.text(

        textoObs,

        18,

        210

    );
    // CONDUTOR

    pdf.line(

        55,

        245,

        155,

        245

    );

    pdf.text(

        "ASSINATURA DO CONDUTOR",

        105,

        252,

        {

            align:"center"

        }

    );
        

    // ==================================
    // RODAPÉ
    // ==================================

    pdf.setFontSize(9);

    pdf.text(

        "FROTA DEMO - Sistema de Controle Operacional",

        105,

        285,

        {

            align:"center"

        }

    );

    console.log(
        descricao
    );

    console.log(
        observacoes
    );
    // ==================================
    // DOWNLOAD
    // ==================================

    pdf.save(

        `${numeroFicha}.pdf`

    );
};

window.baixarModeloAvaria = function(){
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      pdf.setFontSize(18);
      pdf.text('FROTA DEMO - Ficha de avaria', 20, 25);
      pdf.setFontSize(11);
      pdf.text('DEMONSTRACAO - SEM VALIDADE OFICIAL', 20, 38);
      ['Viatura / Placa:', 'Condutor ficticio:', 'Data / Hora:', 'Local ficticio:', 'Descricao da avaria:', 'Observacoes:'].forEach((label, i) => {
        pdf.text(label, 20, 60 + i * 30);
        pdf.line(20, 75 + i * 30, 190, 75 + i * 30);
      });
      pdf.save('MODELO_AVARIA_DEMO.pdf');
    };

window.carregarFichasAvaria =
async function(){

    const snapshot =
        await getDocs(
            fichasAvariaRef
        );

    snapshot.forEach(
        (docItem)=>{

            const ficha =
                docItem.data();

            // render card

        }
    );

}




//==================================
// STATUS DO SISTEMA
//==================================

window.addEventListener("online", ()=>{

    atualizarStatusSistema("online");

});

window.addEventListener("offline", ()=>{

    atualizarStatusSistema("offline");

});

function atualizarStatusSistema(status){

    const aviso =
        document.getElementById(
            "statusSistema"
        );

    if(!aviso) return;

    aviso.className =
        "status-sistema " + status;

        if(status==="online"){

            aviso.className =
                "status-toast online";

            aviso.innerHTML = `

                <i class="fa-solid fa-circle-check"></i>

                <span>Demonstração local pronta.</span>

            `;

            setTimeout(()=>{

                aviso.style.opacity="0";

                aviso.style.transform="translateY(20px)";

            },2500);

        }

        if(status==="offline"){

            aviso.style.opacity="1";

            aviso.style.transform="translateY(0)";

            aviso.className =
                "status-toast offline";

            aviso.innerHTML = `

                <i class="fa-solid fa-triangle-exclamation"></i>

                <span>

                Sem conexão com a Internet.
                Os registros continuam neste navegador. Recursos externos precisam de internet.

                </span>

            `;

        }

    if(status==="carregando"){

        aviso.style.opacity="1";

        aviso.style.transform="translateY(0)";

        aviso.className =
            "status-toast carregando";

        aviso.innerHTML = `

            <i class="fa-solid fa-circle-notch fa-spin"></i>

            <span>

            Carregando informações do sistema...

            </span>

        `;

    }

}