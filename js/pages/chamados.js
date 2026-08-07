// js/pages/chamados.js
import { chamadosService } from '../services/chamadosService.js';
import { auth } from '../firebase/config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

let estadoPagina = {
    chamados: [],
    listas: { equipamentos: [], cenarios: [] },
    filtros: { dataInicial: '', dataFinal: '', status: 'TODOS', numero: '', msisdn: '', cliente: '' },
    paginaAtual: 1,
    itensPorPagina: 10,
    editando: false,
    chamadoEditando: null
};

export function initChamados() {
    // Aguardar o Firebase verificar autenticação
    onAuthStateChanged(auth, async (usuario) => {
        if (!usuario) {
            window.location.href = 'login.html';
            return;
        }

        try {
            atualizarInfoUsuario(usuario);
            await carregarListas();
            configurarCamposAutomaticos(usuario);
            await gerarProximoNumero();
            await carregarDados();
            configurarEventListeners();
            configurarLogout();
            configurarMascaraMSISDN();
            console.log('✅ Módulo de Chamados inicializado');
        } catch (error) {
            console.error('Erro:', error);
        }
    });
}

function atualizarInfoUsuario(usuario) {
    const el = document.getElementById('usuarioLogado');
    if (el) el.textContent = usuario.email || 'Usuário';
}

async function carregarListas() {
    try {
        estadoPagina.listas = await chamadosService.buscarListas();
        const se = document.getElementById('equipamento');
        const sc = document.getElementById('cenario');
        if (se) { se.innerHTML = '<option value="">Selecione...</option>' + estadoPagina.listas.equipamentos.map(e => `<option value="${e}">${e}</option>`).join(''); }
        if (sc) { sc.innerHTML = '<option value="">Selecione...</option>' + estadoPagina.listas.cenarios.map(c => `<option value="${c}">${c}</option>`).join(''); }
    } catch (e) { console.error('Erro listas:', e); }
}

function configurarCamposAutomaticos(usuario) {
    const a = document.getElementById('analista');
    const d = document.getElementById('dataHora');
    if (a) a.value = usuario.email?.split('@')[0] || 'helio';
    if (d) { const now = new Date(); d.value = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`; }
}

async function gerarProximoNumero() {
    try {
        const n = await chamadosService.gerarNumeroChamado();
        const c = document.getElementById('chamado');
        if (c) c.value = n;
    } catch (e) { console.error('Erro número:', e); }
}

function configurarMascaraMSISDN() {
    const c = document.getElementById('msisdn');
    if (c) c.addEventListener('input', e => { let v = e.target.value.replace(/\D/g,''); if(v.length<=11){ if(v.length>2) v=`(${v.substring(0,2)}) ${v.substring(2)}`; if(v.length>10) v=`${v.substring(0,10)}-${v.substring(10)}`; e.target.value=v; } });
}

async function carregarDados() {
    try {
        mostrarLoading(true);
        estadoPagina.chamados = await chamadosService.buscarChamadosComFiltros(estadoPagina.filtros);
        estadoPagina.paginaAtual = 1;
        renderizarTabela();
        renderizarPaginacao();
        document.getElementById('infoRegistros').textContent = `Total: ${estadoPagina.chamados.length}`;
    } catch (e) { console.error('Erro dados:', e); }
    finally { mostrarLoading(false); }
}

function renderizarTabela() {
    const tbody = document.getElementById('tabelaChamados');
    if (!tbody) return;
    const ini = (estadoPagina.paginaAtual-1)*estadoPagina.itensPorPagina;
    const pag = estadoPagina.chamados.slice(ini, ini+estadoPagina.itensPorPagina);
    if (!pag.length) { tbody.innerHTML = '<tr><td colspan="10" class="text-center py-4">Nenhum chamado</td></tr>'; return; }
    tbody.innerHTML = pag.map(c => `<tr>
        <td><span class="badge bg-secondary">#${c.numero||'-'}</span></td>
        <td>${c.dataHora||'-'}</td><td>${c.analista||'-'}</td><td>${c.msisdn||'-'}</td>
        <td>${c.equipamento||'-'}</td><td>${c.cenario||'-'}</td><td>${c.email||'-'}</td>
        <td><span class="badge ${c.status==='ABERTO'?'bg-danger':c.status==='EXECUCAO'?'bg-warning text-dark':c.status==='AGUARDANDO'?'bg-info':'bg-success'}">${c.status||'ABERTO'}</span></td>
        <td>${c.observacoes||'-'}</td>
        <td><button class="btn btn-outline-primary btn-sm" onclick="window.editarChamado('${c.id}')"><i class="bi bi-pencil"></i></button></td>
    </tr>`).join('');
}

function renderizarPaginacao() {
    const c = document.getElementById('paginacaoChamados');
    if (!c) return;
    const t = Math.ceil(estadoPagina.chamados.length/estadoPagina.itensPorPagina);
    if (t<=1){ c.innerHTML=''; return; }
    let h = '<ul class="pagination pagination-sm mb-0">';
    h += `<li class="page-item ${estadoPagina.paginaAtual===1?'disabled':''}"><button class="page-link" onclick="window.mudarPagina(${estadoPagina.paginaAtual-1})">◄</button></li>`;
    for(let i=1;i<=t;i++) h += `<li class="page-item ${i===estadoPagina.paginaAtual?'active':''}"><button class="page-link" onclick="window.mudarPagina(${i})">${i}</button></li>`;
    h += `<li class="page-item ${estadoPagina.paginaAtual===t?'disabled':''}"><button class="page-link" onclick="window.mudarPagina(${estadoPagina.paginaAtual+1})">►</button></li></ul>`;
    c.innerHTML = h;
}

function configurarEventListeners() {
    document.getElementById('btnSalvar')?.addEventListener('click', salvarChamado);
    document.getElementById('btnCancelar')?.addEventListener('click', cancelarEdicao);
    document.getElementById('btnBuscar')?.addEventListener('click', ()=>{ aplicarFiltros(); });
    document.getElementById('btnLimparFiltros')?.addEventListener('click', limparFiltros);
    document.getElementById('buscaNumero')?.addEventListener('keypress', e=>{ if(e.key==='Enter') aplicarFiltros(); });
    window.editarChamado = editarChamado;
    window.mudarPagina = mudarPagina;
}

async function salvarChamado() {
    try {
        const d = {
            analista: document.getElementById('analista').value,
            dataHora: document.getElementById('dataHora').value,
            msisdn: document.getElementById('msisdn').value,
            equipamento: document.getElementById('equipamento').value,
            cenario: document.getElementById('cenario').value,
            observacoes: document.getElementById('observacoes').value,
            email: document.getElementById('email').value,
            flag: document.getElementById('flag').checked,
            tituloEmail: document.getElementById('tituloEmail').value
        };
        if (estadoPagina.editando) {
            await chamadosService.atualizarChamado(estadoPagina.chamadoEditando, d);
            alert('✅ Atualizado!');
        } else {
            await chamadosService.criarChamado(d);
            alert('✅ Criado!');
            await gerarProximoNumero();
        }
        cancelarEdicao();
        await carregarDados();
    } catch (e) { console.error('Erro:', e); alert('❌ Erro'); }
}

function cancelarEdicao() {
    estadoPagina.editando = false;
    estadoPagina.chamadoEditando = null;
    document.getElementById('formChamado').reset();
    configurarCamposAutomaticos(auth.currentUser);
    gerarProximoNumero();
}

async function editarChamado(id) {
    try {
        const c = await chamadosService.buscarChamado(id);
        estadoPagina.editando = true;
        estadoPagina.chamadoEditando = id;
        document.getElementById('analista').value = c.analista || '';
        document.getElementById('dataHora').value = c.dataHora || '';
        document.getElementById('chamado').value = c.numero || '';
        document.getElementById('msisdn').value = c.msisdn || '';
        document.getElementById('equipamento').value = c.equipamento || '';
        document.getElementById('cenario').value = c.cenario || '';
        document.getElementById('observacoes').value = c.observacoes || '';
        document.getElementById('email').value = c.email || '';
        document.getElementById('flag').checked = c.flag || false;
        document.getElementById('tituloEmail').value = c.tituloEmail || '';
        document.getElementById('formChamado').scrollIntoView({ behavior: 'smooth' });
    } catch (e) { console.error('Erro:', e); }
}

function aplicarFiltros() {
    estadoPagina.filtros.numero = document.getElementById('buscaNumero')?.value || '';
    estadoPagina.filtros.msisdn = document.getElementById('buscaMSISDN')?.value || '';
    estadoPagina.filtros.cliente = document.getElementById('buscaCliente')?.value || '';
    estadoPagina.filtros.status = document.getElementById('filtroStatus')?.value || 'TODOS';
    estadoPagina.filtros.dataInicial = document.getElementById('dataInicial')?.value || '';
    estadoPagina.filtros.dataFinal = document.getElementById('dataFinal')?.value || '';
    carregarDados();
}

function limparFiltros() {
    ['buscaNumero','buscaMSISDN','buscaCliente','dataInicial','dataFinal'].forEach(id => { const e=document.getElementById(id); if(e)e.value=''; });
    document.getElementById('filtroStatus').value='TODOS';
    aplicarFiltros();
}

function mudarPagina(p) {
    const t = Math.ceil(estadoPagina.chamados.length/estadoPagina.itensPorPagina);
    if(p<1||p>t) return;
    estadoPagina.paginaAtual = p;
    renderizarTabela();
    renderizarPaginacao();
}

function configurarLogout() {
    document.getElementById('btnSair')?.addEventListener('click', async () => {
        await auth.signOut();
        window.location.href = 'login.html';
    });
}

function mostrarLoading(m) {
    const s = document.getElementById('loadingSpinner');
    if (s) s.style.display = m ? 'block' : 'none';
}
