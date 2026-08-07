// js/pages/chamados.js
import { chamadosService } from '../services/chamadosService.js';
import { auth } from '../firebase/config.js';

// Estado da página
let estadoPagina = {
    chamados: [],
    listas: {
        equipamentos: [],
        cenarios: []
    },
    filtros: {
        dataInicial: '',
        dataFinal: '',
        status: 'TODOS',
        numero: '',
        msisdn: '',
        cliente: ''
    },
    paginaAtual: 1,
    itensPorPagina: 10,
    editando: false,
    chamadoEditando: null
};

export async function initChamados() {
    try {
        const usuario = auth.currentUser;
        if (!usuario) {
            window.location.href = 'login.html';
            return;
        }

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
        console.error('Erro ao inicializar chamados:', error);
    }
}

function atualizarInfoUsuario(usuario) {
    const el = document.getElementById('usuarioLogado');
    if (el) el.textContent = usuario.email || 'Usuário';
}

async function carregarListas() {
    try {
        estadoPagina.listas = await chamadosService.buscarListas();
        preencherDropdowns();
    } catch (error) {
        console.error('Erro ao carregar listas:', error);
    }
}

function preencherDropdowns() {
    const selectEquip = document.getElementById('equipamento');
    const selectCen = document.getElementById('cenario');

    if (selectEquip) {
        selectEquip.innerHTML = '<option value="">Selecione...</option>';
        estadoPagina.listas.equipamentos.forEach(e => {
            selectEquip.innerHTML += `<option value="${e}">${e}</option>`;
        });
    }

    if (selectCen) {
        selectCen.innerHTML = '<option value="">Selecione...</option>';
        estadoPagina.listas.cenarios.forEach(c => {
            selectCen.innerHTML += `<option value="${c}">${c}</option>`;
        });
    }
}

function configurarCamposAutomaticos(usuario) {
    const campoAnalista = document.getElementById('analista');
    if (campoAnalista) {
        campoAnalista.value = usuario.email?.split('@')[0] || 'helio';
    }

    const campoDataHora = document.getElementById('dataHora');
    if (campoDataHora) {
        campoDataHora.value = formatarDataHora(new Date());
    }
}

async function gerarProximoNumero() {
    try {
        const numero = await chamadosService.gerarNumeroChamado();
        const campoChamado = document.getElementById('chamado');
        if (campoChamado) campoChamado.value = numero;
    } catch (error) {
        console.error('Erro ao gerar número:', error);
    }
}

function configurarMascaraMSISDN() {
    const campo = document.getElementById('msisdn');
    if (campo) {
        campo.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length <= 11) {
                if (valor.length > 2) valor = `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
                if (valor.length > 10) valor = `${valor.substring(0, 10)}-${valor.substring(10)}`;
                e.target.value = valor;
            }
        });
    }
}

async function carregarDados() {
    try {
        mostrarLoading(true);
        estadoPagina.chamados = await chamadosService.buscarChamadosComFiltros(estadoPagina.filtros);
        estadoPagina.paginaAtual = 1;
        renderizarTabela();
        renderizarPaginacao();
        atualizarInfoRegistros();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    } finally {
        mostrarLoading(false);
    }
}

function atualizarInfoRegistros() {
    const el = document.getElementById('infoRegistros');
    if (el) el.textContent = `Total de registros: ${estadoPagina.chamados.length}`;
}

function renderizarTabela() {
    const tbody = document.getElementById('tabelaChamados');
    if (!tbody) return;

    const inicio = (estadoPagina.paginaAtual - 1) * estadoPagina.itensPorPagina;
    const fim = inicio + estadoPagina.itensPorPagina;
    const paginados = estadoPagina.chamados.slice(inicio, fim);

    if (paginados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center py-4 text-muted">
            <i class="bi bi-inbox display-4 d-block mb-3"></i>Nenhum chamado encontrado</td></tr>`;
        return;
    }

    tbody.innerHTML = paginados.map(c => `
        <tr>
            <td><span class="badge bg-secondary">#${c.numero || '-'}</span></td>
            <td>${c.dataHora || '-'}</td>
            <td>${c.analista || '-'}</td>
            <td>${c.msisdn || '-'}</td>
            <td>${c.equipamento || '-'}</td>
            <td>${c.cenario || '-'}</td>
            <td>${c.email || '-'}</td>
            <td><span class="badge ${getStatusClass(c.status)}">${c.status || 'ABERTO'}</span></td>
            <td>${c.observacoes || '-'}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="window.editarChamado('${c.id}')" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderizarPaginacao() {
    const container = document.getElementById('paginacaoChamados');
    if (!container) return;

    const totalPaginas = Math.ceil(estadoPagina.chamados.length / estadoPagina.itensPorPagina);
    if (totalPaginas <= 1) { container.innerHTML = ''; return; }

    let html = '<ul class="pagination pagination-sm mb-0">';
    html += `<li class="page-item ${estadoPagina.paginaAtual === 1 ? 'disabled' : ''}">
        <button class="page-link" onclick="window.mudarPagina(${estadoPagina.paginaAtual - 1})">◄</button></li>`;
    
    for (let i = 1; i <= totalPaginas; i++) {
        html += `<li class="page-item ${i === estadoPagina.paginaAtual ? 'active' : ''}">
            <button class="page-link" onclick="window.mudarPagina(${i})">${i}</button></li>`;
    }
    
    html += `<li class="page-item ${estadoPagina.paginaAtual === totalPaginas ? 'disabled' : ''}">
        <button class="page-link" onclick="window.mudarPagina(${estadoPagina.paginaAtual + 1})">►</button></li>`;
    html += '</ul>';
    container.innerHTML = html;
}

function configurarEventListeners() {
    document.getElementById('btnSalvar')?.addEventListener('click', salvarChamado);
    document.getElementById('btnCancelar')?.addEventListener('click', cancelarEdicao);
    document.getElementById('btnBuscar')?.addEventListener('click', aplicarFiltros);
    document.getElementById('btnLimparFiltros')?.addEventListener('click', limparFiltros);
    
    document.getElementById('buscaNumero')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') aplicarFiltros();
    });

    window.editarChamado = editarChamado;
    window.mudarPagina = mudarPagina;
}

async function salvarChamado() {
    try {
        const dados = {
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

        if (estadoPagina.editando && estadoPagina.chamadoEditando) {
            await chamadosService.atualizarChamado(estadoPagina.chamadoEditando, dados);
            alert('✅ Chamado atualizado!');
        } else {
            await chamadosService.criarChamado(dados);
            alert('✅ Chamado criado!');
            await gerarProximoNumero();
        }

        cancelarEdicao();
        await carregarDados();
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('❌ Erro ao salvar chamado');
    }
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
        const chamado = await chamadosService.buscarChamado(id);
        estadoPagina.editando = true;
        estadoPagina.chamadoEditando = id;
        
        document.getElementById('analista').value = chamado.analista || '';
        document.getElementById('dataHora').value = chamado.dataHora || '';
        document.getElementById('chamado').value = chamado.chamado || chamado.numero || '';
        document.getElementById('msisdn').value = chamado.msisdn || '';
        document.getElementById('equipamento').value = chamado.equipamento || '';
        document.getElementById('cenario').value = chamado.cenario || '';
        document.getElementById('observacoes').value = chamado.observacoes || '';
        document.getElementById('email').value = chamado.email || '';
        document.getElementById('flag').checked = chamado.flag || false;
        document.getElementById('tituloEmail').value = chamado.tituloEmail || '';
        
        document.getElementById('formChamado').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Erro ao editar:', error);
    }
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
    ['buscaNumero', 'buscaMSISDN', 'buscaCliente'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    const statusEl = document.getElementById('filtroStatus'); if (statusEl) statusEl.value = 'TODOS';
    ['dataInicial', 'dataFinal'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    aplicarFiltros();
}

function mudarPagina(pagina) {
    const total = Math.ceil(estadoPagina.chamados.length / estadoPagina.itensPorPagina);
    if (pagina < 1 || pagina > total) return;
    estadoPagina.paginaAtual = pagina;
    renderizarTabela();
    renderizarPaginacao();
}

function configurarLogout() {
    document.getElementById('btnSair')?.addEventListener('click', async () => {
        try {
            await auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Erro ao sair:', error);
        }
    });
}

function formatarDataHora(data) {
    const d = String(data.getDate()).padStart(2, '0');
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const a = data.getFullYear();
    const h = String(data.getHours()).padStart(2, '0');
    const min = String(data.getMinutes()).padStart(2, '0');
    return `${d}/${m}/${a} ${h}:${min}`;
}

function getStatusClass(status) {
    const classes = {
        'ABERTO': 'bg-danger',
        'EXECUCAO': 'bg-warning text-dark',
        'AGUARDANDO': 'bg-info',
        'FINALIZADO': 'bg-success'
    };
    return classes[status] || 'bg-secondary';
}

function mostrarLoading(mostrar) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = mostrar ? 'block' : 'none';
}
