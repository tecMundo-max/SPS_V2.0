// js/pages/chamados.js
// Controller da página de Chamados
// Gerencia a interface e eventos

import { chamadosService } from '../services/chamadosService.js';
import { auth } from '../firebase/config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Estado da página
const estado = {
    chamados: [],
    listas: { equipamentos: [], cenarios: [] },
    paginaAtual: 1,
    linhasPorPagina: 20,
    editando: false,
    idEditando: null,
    ehAdmin: false
};

// Cache de elementos DOM
let els = {};

export function initChamados() {
    
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Verificar se é admin
        estado.ehAdmin = user.email === 'helio.goes@sysmap.com.br';

        // Cache de elementos
        cacheElements();

        // Atualizar UI
        els.usuarioLogado.textContent = user.email || 'Usuário';
        
        // Preencher campos automáticos
        preencherAnalista(user);
        preencherDataAtual();
        aplicarFiltroHoje();

        // Carregar dados
        await carregarListas();
        await carregarChamados();

        // Configurar eventos
        configurarEventos();

        console.log('✅ Chamados inicializado');
    });
}

function cacheElements() {
    els = {
        usuarioLogado: document.getElementById('usuarioLogado'),
        form: document.getElementById('formChamado'),
        analista: document.getElementById('analista'),
        data: document.getElementById('data'),
        chamado: document.getElementById('chamado'),
        linha: document.getElementById('linha'),
        equipamento: document.getElementById('equipamentoSelect'),
        cenario: document.getElementById('cenarioSelect'),
        observacoes: document.getElementById('observacoes'),
        chamadoId: document.getElementById('chamadoId'),
        fDataIni: document.getElementById('fDataIni'),
        fDataFim: document.getElementById('fDataFim'),
        fAnalista: document.getElementById('fAnalista'),
        fChamado: document.getElementById('fChamado'),
        fLinha: document.getElementById('fLinha'),
        fEquipamento: document.getElementById('fEquipamento'),
        fCenario: document.getElementById('fCenario'),
        totalEncontrado: document.getElementById('totalEncontrado'),
        tbody: document.querySelector('#tblChamados tbody'),
        btnMais: document.getElementById('btnMais'),
        loading: document.getElementById('loading')
    };
}

function preencherAnalista(user) {
    if (els.analista) {
        els.analista.value = user.email?.split('@')[0] || '';
    }
}

function preencherDataAtual() {
    if (els.data) {
        const agora = new Date();
        const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000);
        els.data.value = local.toISOString().slice(0, 16);
    }
}

function aplicarFiltroHoje() {
    const hoje = new Date();
    const dataStr = hoje.getFullYear() + '-' +
        String(hoje.getMonth() + 1).padStart(2, '0') + '-' +
        String(hoje.getDate()).padStart(2, '0');
    
    if (els.fDataIni) els.fDataIni.value = dataStr;
    if (els.fDataFim) els.fDataFim.value = dataStr;
}

// ======================================================
// LISTAS
// ======================================================

async function carregarListas() {
    try {
        estado.listas = await chamadosService.buscarListas();
        preencherCombo(els.equipamento, estado.listas.equipamentos);
        preencherCombo(els.cenario, estado.listas.cenarios);
        preencherComboFiltro(els.fEquipamento, estado.listas.equipamentos);
        preencherComboFiltro(els.fCenario, estado.listas.cenarios);
    } catch (error) {
        console.error('Erro ao carregar listas:', error);
    }
}

function preencherCombo(combo, lista) {
    if (!combo) return;
    combo.innerHTML = '<option value="">(selecione)</option>';
    lista.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item;
        opt.textContent = item;
        combo.appendChild(opt);
    });
}

function preencherComboFiltro(combo, lista) {
    if (!combo) return;
    combo.innerHTML = '<option value="">Todos</option>';
    lista.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item;
        opt.textContent = item;
        combo.appendChild(opt);
    });
}

// ======================================================
// CHAMADOS
// ======================================================

async function carregarChamados() {
    try {
        mostrarLoading(true);
        
        const filtros = {
            dataIni: els.fDataIni?.value || '',
            dataFim: els.fDataFim?.value || '',
            analista: els.fAnalista?.value || '',
            chamado: els.fChamado?.value || '',
            linha: els.fLinha?.value || '',
            equipamento: els.fEquipamento?.value || '',
            cenario: els.fCenario?.value || ''
        };

        estado.chamados = await chamadosService.buscarChamadosComFiltros(filtros);
        estado.paginaAtual = 1;
        
        renderizarTabela();
        atualizarTotal();
    } catch (error) {
        console.error('Erro ao carregar chamados:', error);
    } finally {
        mostrarLoading(false);
    }
}

function renderizarTabela() {
    if (!els.tbody) return;

    const fim = estado.paginaAtual * estado.linhasPorPagina;
    const paginados = estado.chamados.slice(0, fim);

    if (paginados.length === 0) {
        els.tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    Nenhum chamado encontrado
                </td>
            </tr>`;
        
        if (els.btnMais) els.btnMais.style.display = 'none';
        return;
    }

    els.tbody.innerHTML = paginados.map(c => {
        const cor = obterCorAnalista(c.analista);
        
        return `
            <tr style="background: ${cor}; color: white;">
                <td style="color: white;">${formatarData(c.createdAt)}</td>
                <td style="color: white;">${c.analista || '-'}</td>
                <td style="color: white;">${c.chamado || '-'}</td>
                <td style="color: white;">${c.linha || '-'}</td>
                <td style="color: white;">${c.equipamento || '-'}</td>
                <td style="color: white;">${c.cenario || '-'}</td>
                <td style="color: white;" title="${c.observacoes || ''}">${truncarTexto(c.observacoes)}</td>
                <td>
                    <button class="btn btn-warning btn-sm btn-action me-1" onclick="window.editarChamado('${c.id}')" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${estado.ehAdmin ? `
                    <button class="btn btn-danger btn-sm btn-action" onclick="window.excluirChamado('${c.id}')" title="Excluir">
                        <i class="bi bi-trash"></i>
                    </button>` : ''}
                </td>
            </tr>`;
    }).join('');

    // Mostrar/ocultar botão "Mais"
    if (els.btnMais) {
        if (estado.chamados.length > fim) {
            els.btnMais.style.display = 'block';
        } else {
            els.btnMais.style.display = 'none';
        }
    }
}

function atualizarTotal() {
    if (els.totalEncontrado) {
        els.totalEncontrado.textContent = `Total encontrado: ${estado.chamados.length}`;
    }
}

function carregarMais() {
    estado.paginaAtual++;
    renderizarTabela();
}

// ======================================================
// FORMULÁRIO
// ======================================================

function limparFormulario() {
    if (els.form) els.form.reset();
    if (els.chamadoId) els.chamadoId.value = '';
    
    const user = auth.currentUser;
    preencherAnalista(user);
    preencherDataAtual();
    
    estado.editando = false;
    estado.idEditando = null;
}

function criarPayload() {
    const chamado = (els.chamado?.value || '').trim().toUpperCase();
    
    if (!chamado) {
        alert('O campo Chamado é obrigatório');
        return null;
    }

    const dataSelecionada = els.data?.value;
    const timestamp = dataSelecionada ? new Date(dataSelecionada).getTime() : Date.now();

    if (isNaN(timestamp)) {
        alert('Data inválida');
        return null;
    }

    return {
        analista: (els.analista?.value || '').trim(),
        chamado: chamado,
        linha: (els.linha?.value || '').replace(/\D/g, ''),
        equipamento: els.equipamento?.value || '',
        cenario: els.cenario?.value || '',
        observacoes: (els.observacoes?.value || '').trim(),
        createdAt: timestamp,
        createdBy: auth.currentUser?.email || 'web'
    };
}

async function salvarChamado(e) {
    if (e) e.preventDefault();

    const payload = criarPayload();
    if (!payload) return;

    try {
        if (estado.editando && estado.idEditando) {
            await chamadosService.atualizarChamado(estado.idEditando, payload);
            alert('✅ Chamado atualizado!');
        } else {
            await chamadosService.criarChamado(payload);
            alert('✅ Chamado criado!');
        }

        limparFormulario();
        await carregarChamados();
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('❌ Erro ao salvar chamado');
    }
}

async function editarChamado(id) {
    try {
        const chamado = await chamadosService.buscarChamado(id);
        
        estado.editando = true;
        estado.idEditando = id;

        if (els.chamadoId) els.chamadoId.value = id;
        if (els.analista) els.analista.value = chamado.analista || '';
        if (els.chamado) els.chamado.value = chamado.chamado || '';
        if (els.linha) els.linha.value = chamado.linha || '';
        if (els.equipamento) els.equipamento.value = chamado.equipamento || '';
        if (els.cenario) els.cenario.value = chamado.cenario || '';
        if (els.observacoes) els.observacoes.value = chamado.observacoes || '';

        // Data
        if (chamado.createdAt && els.data) {
            const local = new Date(chamado.createdAt - new Date().getTimezoneOffset() * 60000);
            els.data.value = local.toISOString().slice(0, 16);
        }

        // Scroll para o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Erro ao editar:', error);
        alert('❌ Erro ao carregar chamado');
    }
}

async function excluirChamado(id) {
    const chamado = estado.chamados.find(c => c.id === id);
    if (!chamado) return;

    if (!confirm(`Deseja excluir o chamado ${chamado.chamado}?`)) {
        return;
    }

    try {
        await chamadosService.excluirChamado(id);
        alert('✅ Chamado excluído!');
        await carregarChamados();
    } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('❌ Erro ao excluir chamado');
    }
}

// ======================================================
// EVENTOS
// ======================================================

function configurarEventos() {
    // Form submit
    if (els.form) {
        els.form.addEventListener('submit', salvarChamado);
    }

    // Cancelar
    document.getElementById('btnCancelar')?.addEventListener('click', limparFormulario);

    // Pesquisar
    document.getElementById('btnPesquisar')?.addEventListener('click', () => {
        estado.paginaAtual = 1;
        carregarChamados();
    });

    // Hoje
    document.getElementById('btnHoje')?.addEventListener('click', () => {
        aplicarFiltroHoje();
        estado.paginaAtual = 1;
        carregarChamados();
    });

    // Limpar filtros
    document.getElementById('btnLimpar')?.addEventListener('click', () => {
        if (els.fAnalista) els.fAnalista.value = '';
        if (els.fChamado) els.fChamado.value = '';
        if (els.fLinha) els.fLinha.value = '';
        if (els.fEquipamento) els.fEquipamento.value = '';
        if (els.fCenario) els.fCenario.value = '';
        aplicarFiltroHoje();
        estado.paginaAtual = 1;
        carregarChamados();
    });

    // Botão Mais
    if (els.btnMais) {
        els.btnMais.addEventListener('click', carregarMais);
    }

    // Logout
    document.getElementById('btnSair')?.addEventListener('click', async () => {
        await auth.signOut();
        window.location.href = 'login.html';
    });

    // Máscara linha
    if (els.linha) {
        els.linha.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '').slice(0, 11);
            if (v.length > 2) v = `(${v.substring(0,2)}) ${v.substring(2)}`;
            if (v.length > 10) v = `${v.substring(0,10)}-${v.substring(10)}`;
            e.target.value = v;
        });
    }

    // Auto pesquisa nos filtros
    [els.fAnalista, els.fChamado, els.fLinha, els.fEquipamento, els.fCenario].forEach(campo => {
        if (campo) {
            campo.addEventListener('change', () => {
                estado.paginaAtual = 1;
                carregarChamados();
            });
            campo.addEventListener('keyup', () => {
                estado.paginaAtual = 1;
                carregarChamados();
            });
        }
    });

    [els.fDataIni, els.fDataFim].forEach(campo => {
        if (campo) {
            campo.addEventListener('change', () => {
                estado.paginaAtual = 1;
                carregarChamados();
            });
        }
    });

    // Expor funções globais
    window.editarChamado = editarChamado;
    window.excluirChamado = excluirChamado;
}

// ======================================================
// UTILITÁRIOS
// ======================================================

function formatarData(timestamp) {
    if (!timestamp) return '-';
    const d = new Date(timestamp);
    return d.toLocaleDateString('pt-BR') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0');
}

function truncarTexto(texto, tamanho = 30) {
    if (!texto) return '';
    if (texto.length <= tamanho) return texto;
    return texto.substring(0, tamanho) + '...';
}

const coresAnalistas = [
    '#1a1a2e', '#16213e', '#0f3460', '#533483',
    '#e94560', '#1f2937', '#374151', '#0f766e',
    '#14532d', '#7c2d12', '#4c1d95', '#7f1d1d'
];

function obterCorAnalista(nome) {
    if (!nome) return '#121218';
    let hash = 0;
    for (let i = 0; i < nome.length; i++) {
        hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    }
    return coresAnalistas[Math.abs(hash) % coresAnalistas.length];
}

function mostrarLoading(mostrar) {
    if (els.loading) {
        els.loading.style.display = mostrar ? 'block' : 'none';
    }
}
