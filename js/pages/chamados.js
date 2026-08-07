// js/pages/chamados.js
import { chamadosService } from '../services/chamadosService.js';
import { auth } from '../config/firebase.js';
import { router } from '../core/router.js';

// Estado da página
let estadoPagina = {
    chamados: [],
    filtros: {
        dataInicial: '',
        dataFinal: '',
        status: 'TODOS',
        analista: '',
        termoBusca: ''
    },
    paginaAtual: 1,
    itensPorPagina: 10
};

/**
 * Inicializa a página de chamados
 */
export async function initChamados() {
    try {
        // Verificar autenticação
        const usuario = auth.currentUser;
        if (!usuario) {
            router.navegar('login.html');
            return;
        }

        // Atualizar informações do usuário na interface
        atualizarInfoUsuario(usuario);

        // Configurar data inicial e final padrão (últimos 30 dias)
        configurarDatasPadrao();

        // Carregar dados iniciais
        await carregarDados();

        // Configurar event listeners
        configurarEventListeners();

        // Configurar logout
        configurarLogout();

        console.log('✅ Módulo de Chamados inicializado');
    } catch (error) {
        console.error('Erro ao inicializar chamados:', error);
        mostrarErro('Erro ao carregar chamados. Tente novamente.');
    }
}

/**
 * Atualiza informações do usuário na interface
 */
function atualizarInfoUsuario(usuario) {
    const elementoUsuario = document.getElementById('usuarioLogado');
    if (elementoUsuario) {
        elementoUsuario.textContent = usuario.email || 'Usuário';
    }
}

/**
 * Configura datas padrão para os filtros
 */
function configurarDatasPadrao() {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    const dataInicialInput = document.getElementById('dataInicial');
    const dataFinalInput = document.getElementById('dataFinal');

    if (dataInicialInput) {
        dataInicialInput.value = trintaDiasAtras.toISOString().split('T')[0];
        estadoPagina.filtros.dataInicial = dataInicialInput.value;
    }

    if (dataFinalInput) {
        dataFinalInput.value = hoje.toISOString().split('T')[0];
        estadoPagina.filtros.dataFinal = dataFinalInput.value;
    }
}

/**
 * Carrega todos os dados necessários
 */
async function carregarDados() {
    try {
        mostrarLoading(true);

        // Carregar chamados com filtros
        estadoPagina.chamados = await chamadosService.buscarChamadosComFiltros(estadoPagina.filtros);
        
        // Resetar paginação
        estadoPagina.paginaAtual = 1;
        
        // Atualizar info de registros
        atualizarInfoRegistros();
        
        // Renderizar tabela
        renderizarTabela();
        renderizarPaginacao();

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarErro('Erro ao carregar dados dos chamados');
    } finally {
        mostrarLoading(false);
    }
}

/**
 * Atualiza informação de quantidade de registros
 */
function atualizarInfoRegistros() {
    const infoRegistros = document.getElementById('infoRegistros');
    if (infoRegistros) {
        const total = estadoPagina.chamados.length;
        infoRegistros.textContent = `Total de registros: ${total}`;
    }
}

/**
 * Renderiza a tabela de chamados
 */
function renderizarTabela() {
    const tbody = document.getElementById('tabelaChamados');
    if (!tbody) return;

    const inicio = (estadoPagina.paginaAtual - 1) * estadoPagina.itensPorPagina;
    const fim = inicio + estadoPagina.itensPorPagina;
    const chamadosPaginados = estadoPagina.chamados.slice(inicio, fim);

    if (chamadosPaginados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox display-4 d-block mb-3"></i>
                    Nenhum chamado encontrado
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = chamadosPaginados.map(chamado => `
        <tr>
            <td>
                <span class="badge bg-secondary">#${chamado.numero}</span>
            </td>
            <td>${formatarData(chamado.criadoEm)}</td>
            <td>
                <strong>${chamado.cliente || '-'}</strong>
            </td>
            <td>${chamado.linha || '-'}</td>
            <td>
                <span class="badge ${getStatusClass(chamado.status)}">
                    ${getStatusTexto(chamado.status)}
                </span>
            </td>
            <td>
                <span class="badge bg-info">${chamado.fila || 'GERAL'}</span>
            </td>
            <td>${chamado.analista || 'Não atribuído'}</td>
            <td>
                <small class="text-muted">${chamado.ultimaAtualizacao || '-'}</small>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button 
                        class="btn btn-outline-primary" 
                        onclick="window.editarChamado('${chamado.id}')"
                        title="Editar"
                    >
                        <i class="bi bi-pencil"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Renderiza a paginação
 */
function renderizarPaginacao() {
    const container = document.getElementById('paginacaoChamados');
    if (!container) return;

    const totalPaginas = Math.ceil(estadoPagina.chamados.length / estadoPagina.itensPorPagina);
    
    if (totalPaginas <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<ul class="pagination pagination-sm mb-0">';
    
    // Botão Anterior
    html += `
        <li class="page-item ${estadoPagina.paginaAtual === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="window.mudarPagina(${estadoPagina.paginaAtual - 1})">
                ◄
            </button>
        </li>
    `;

    // Páginas
    for (let i = 1; i <= totalPaginas; i++) {
        html += `
            <li class="page-item ${i === estadoPagina.paginaAtual ? 'active' : ''}">
                <button class="page-link" onclick="window.mudarPagina(${i})">
                    ${i}
                </button>
            </li>
        `;
    }

    // Botão Próximo
    html += `
        <li class="page-item ${estadoPagina.paginaAtual === totalPaginas ? 'disabled' : ''}">
            <button class="page-link" onclick="window.mudarPagina(${estadoPagina.paginaAtual + 1})">
                ►
            </button>
        </li>
    `;

    html += '</ul>';
    container.innerHTML = html;
}

/**
 * Configura todos os event listeners
 */
function configurarEventListeners() {
    // Botão de busca
    const btnBuscar = document.getElementById('btnBuscar');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', async () => {
            await aplicarFiltros();
        });
    }

    // Busca por Enter no campo de busca
    const inputBusca = document.getElementById('inputBusca');
    if (inputBusca) {
        inputBusca.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                await aplicarFiltros();
            }
        });
    }

    // Botão Novo Chamado
    const btnNovo = document.getElementById('btnNovoChamado');
    if (btnNovo) {
        btnNovo.addEventListener('click', () => {
            abrirModalNovoChamado();
        });
    }

    // Botão Limpar Filtros
    const btnLimpar = document.getElementById('btnLimparFiltros');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            limparFiltros();
        });
    }

    // Expor funções para escopo global
    window.editarChamado = editarChamado;
    window.mudarPagina = mudarPagina;
    window.fecharModal = fecharModal;
    window.salvarChamado = salvarChamado;
}

/**
 * Aplica os filtros selecionados
 */
async function aplicarFiltros() {
    // Atualizar filtros
    estadoPagina.filtros.dataInicial = document.getElementById('dataInicial')?.value || '';
    estadoPagina.filtros.dataFinal = document.getElementById('dataFinal')?.value || '';
    estadoPagina.filtros.status = document.getElementById('filtroStatus')?.value || 'TODOS';
    estadoPagina.filtros.analista = document.getElementById('filtroAnalista')?.value || '';
    estadoPagina.filtros.termoBusca = document.getElementById('inputBusca')?.value || '';

    // Recarregar dados
    await carregarDados();
}

/**
 * Limpa todos os filtros
 */
function limparFiltros() {
    configurarDatasPadrao();
    
    const filtroStatus = document.getElementById('filtroStatus');
    const filtroAnalista = document.getElementById('filtroAnalista');
    const inputBusca = document.getElementById('inputBusca');
    
    if (filtroStatus) filtroStatus.value = 'TODOS';
    if (filtroAnalista) filtroAnalista.value = '';
    if (inputBusca) inputBusca.value = '';

    aplicarFiltros();
}

/**
 * Abre modal para novo chamado
 */
function abrirModalNovoChamado() {
    const modal = document.getElementById('modalChamado');
    const modalTitle = document.getElementById('modalChamadoTitle');
    const form = document.getElementById('formChamado');

    if (modal && modalTitle && form) {
        modalTitle.textContent = 'Novo Chamado';
        form.reset();
        document.getElementById('chamadoId').value = '';
        
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }
}

/**
 * Edita um chamado existente
 */
async function editarChamado(id) {
    try {
        const chamado = await chamadosService.buscarChamado(id);
        
        const modal = document.getElementById('modalChamado');
        const modalTitle = document.getElementById('modalChamadoTitle');
        
        if (modal && modalTitle) {
            modalTitle.textContent = `Editando Chamado #${chamado.numero}`;
            
            // Preencher formulário
            document.getElementById('chamadoId').value = chamado.id;
            document.getElementById('cliente').value = chamado.cliente || '';
            document.getElementById('linha').value = chamado.linha || '';
            document.getElementById('fila').value = chamado.fila || 'GERAL';
            document.getElementById('analista').value = chamado.analista || '';
            document.getElementById('status').value = chamado.status || 'ABERTO';
            document.getElementById('observacao').value = chamado.observacao || '';
            
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
        }
    } catch (error) {
        console.error('Erro ao carregar chamado:', error);
        mostrarErro('Erro ao carregar dados do chamado');
    }
}

/**
 * Salva um chamado (novo ou edição)
 */
async function salvarChamado() {
    try {
        const id = document.getElementById('chamadoId').value;
        const usuario = auth.currentUser;

        const dados = {
            cliente: document.getElementById('cliente').value,
            linha: document.getElementById('linha').value,
            fila: document.getElementById('fila').value,
            analista: document.getElementById('analista').value,
            status: document.getElementById('status').value,
            observacao: document.getElementById('observacao').value,
            criadoPor: usuario?.email || 'Sistema'
        };

        // Validações básicas
        if (!dados.cliente || !dados.linha) {
            mostrarErro('Cliente e Linha são campos obrigatórios');
            return;
        }

        if (id) {
            // Atualizar chamado existente
            await chamadosService.atualizarChamado(id, dados);
            mostrarSucesso('Chamado atualizado com sucesso!');
        } else {
            // Criar novo chamado
            await chamadosService.criarChamado(dados);
            mostrarSucesso('Chamado criado com sucesso!');
        }

        // Fechar modal e recarregar dados
        fecharModal();
        await carregarDados();

    } catch (error) {
        console.error('Erro ao salvar chamado:', error);
        mostrarErro('Erro ao salvar chamado. Tente novamente.');
    }
}

/**
 * Fecha o modal
 */
function fecharModal() {
    const modal = document.getElementById('modalChamado');
    if (modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
}

/**
 * Muda a página atual
 */
function mudarPagina(pagina) {
    const totalPaginas = Math.ceil(estadoPagina.chamados.length / estadoPagina.itensPorPagina);
    
    if (pagina < 1 || pagina > totalPaginas) {
        return;
    }

    estadoPagina.paginaAtual = pagina;
    renderizarTabela();
    renderizarPaginacao();
}

/**
 * Configura o logout
 */
function configurarLogout() {
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', async () => {
            try {
                await auth.signOut();
                router.navegar('login.html');
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
            }
        });
    }
}

// Funções auxiliares de formatação
function formatarData(dataISO) {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
}

function getStatusClass(status) {
    const classes = {
        'ABERTO': 'bg-warning text-dark',
        'EM_ANDAMENTO': 'bg-primary',
        'FECHADO': 'bg-success',
        'CANCELADO': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

function getStatusTexto(status) {
    const textos = {
        'ABERTO': 'Aberto',
        'EM_ANDAMENTO': 'Em Andamento',
        'FECHADO': 'Fechado',
        'CANCELADO': 'Cancelado'
    };
    return textos[status] || status;
}

function mostrarLoading(mostrar) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = mostrar ? 'block' : 'none';
    }
}

function mostrarErro(mensagem) {
    alert(mensagem);
}

function mostrarSucesso(mensagem) {
    alert(mensagem);
}
