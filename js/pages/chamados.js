// js/pages/chamados.js
import { chamadosService } from '../services/chamadosService.js';
import { auth } from '../config/firebase.js';
import { router } from '../core/router.js';

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

        // Atualizar informações do usuário
        atualizarInfoUsuario(usuario);

        // Carregar listas do banco
        await carregarListas();

        // Configurar campos automáticos
        configurarCamposAutomaticos(usuario);

        // Gerar próximo número
        await gerarProximoNumero();

        // Carregar dados iniciais
        await carregarDados();

        // Configurar event listeners
        configurarEventListeners();

        // Configurar logout
        configurarLogout();

        // Configurar máscara MSISDN
        configurarMascaraMSISDN();

        console.log('✅ Módulo de Chamados inicializado');
    } catch (error) {
        console.error('Erro ao inicializar chamados:', error);
        mostrarErro('Erro ao carregar chamados. Tente novamente.');
    }
}

/**
 * Atualiza informações do usuário
 */
function atualizarInfoUsuario(usuario) {
    const elementoUsuario = document.getElementById('usuarioLogado');
    if (elementoUsuario) {
        elementoUsuario.textContent = usuario.email || 'Usuário';
    }
}

/**
 * Carrega listas do Firebase
 */
async function carregarListas() {
    try {
        estadoPagina.listas = await chamadosService.buscarListas();
        preencherDropdowns();
    } catch (error) {
        console.error('Erro ao carregar listas:', error);
    }
}

/**
 * Preenche dropdowns de equipamento e cenário
 */
function preencherDropdowns() {
    const selectEquipamento = document.getElementById('equipamento');
    const selectCenario = document.getElementById('cenario');

    // Preencher Equipamentos
    if (selectEquipamento) {
        selectEquipamento.innerHTML = '<option value="">Selecione...</option>';
        estadoPagina.listas.equipamentos.forEach(equip => {
            selectEquipamento.innerHTML += `<option value="${equip}">${equip}</option>`;
        });
    }

    // Preencher Cenários
    if (selectCenario) {
        selectCenario.innerHTML = '<option value="">Selecione...</option>';
        estadoPagina.listas.cenarios.forEach(cen => {
            selectCenario.innerHTML += `<option value="${cen}">${cen}</option>`;
        });
    }
}

/**
 * Configura campos automáticos
 */
function configurarCamposAutomaticos(usuario) {
    // Analista
    const campoAnalista = document.getElementById('analista');
    if (campoAnalista) {
        campoAnalista.value = usuario.email?.split('@')[0] || 'helio';
    }

    // Data/Hora
    const campoDataHora = document.getElementById('dataHora');
    if (campoDataHora) {
        campoDataHora.value = formatarDataHora(new Date());
    }
}

/**
 * Gera próximo número de chamado
 */
async function gerarProximoNumero() {
    try {
        const numero = await chamadosService.gerarNumeroChamado();
        const campoChamado = document.getElementById('chamado');
        if (campoChamado) {
            campoChamado.value = numero;
        }
    } catch (error) {
        console.error('Erro ao gerar número:', error);
    }
}

/**
 * Configura máscara MSISDN
 */
function configurarMascaraMSISDN() {
    const campoMSISDN = document.getElementById('msisdn');
    if (campoMSISDN) {
        campoMSISDN.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '');
            
            if (valor.length <= 11) {
                if (valor.length > 2) {
                    valor = `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
                }
                if (valor.length > 10) {
                    valor = `${valor.substring(0, 10)}-${valor.substring(10)}`;
                }
                e.target.value = valor;
            }
        });
    }
}

/**
 * Carrega dados dos chamados
 */
async function carregarDados() {
    try {
        mostrarLoading(true);

        // Carregar chamados com filtros
        estadoPagina.chamados = await chamadosService.buscarChamadosComFiltros(estadoPagina.filtros);
        
        // Atualizar estatísticas
        await atualizarCards();
        
        // Resetar paginação
        estadoPagina.paginaAtual = 1;
        
        // Renderizar tabela
        renderizarTabela();
        renderizarPaginacao();
        atualizarInfoRegistros();

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarErro('Erro ao carregar dados dos chamados');
    } finally {
        mostrarLoading(false);
    }
}

/**
 * Atualiza cards de status
 */
async function atualizarCards() {
    try {
        const stats = await chamadosService.obterEstatisticas();
        
        document.getElementById('cardAberto').textContent = stats.aberto || 0;
        document.getElementById('cardExecucao').textContent = stats.execucao || 0;
        document.getElementById('cardAguardando').textContent = stats.aguardando || 0;
        document.getElementById('cardFinalizado').textContent = stats.finalizado || 0;
    } catch (error) {
        console.error('Erro ao atualizar cards:', error);
    }
}

/**
 * Atualiza info de registros
 */
function atualizarInfoRegistros() {
    const infoRegistros = document.getElementById('infoRegistros');
    if (infoRegistros) {
        infoRegistros.textContent = `Total de registros: ${estadoPagina.chamados.length}`;
    }
}

/**
 * Renderiza tabela de chamados
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
                <td colspan="10" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox display-4 d-block mb-3"></i>
                    Nenhum chamado encontrado
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = chamadosPaginados.map(chamado => `
        <tr>
            <td><span class="badge bg-secondary">#${chamado.numero || '-'}</span></td>
            <td>${chamado.dataHora || '-'}</td>
            <td>${chamado.analista || '-'}</td>
            <td>${chamado.msisdn || '-'}</td>
            <td>${chamado.equipamento || '-'}</td>
            <td>${chamado.cenario || '-'}</td>
            <td>${chamado.email || '-'}</td>
            <td>
                <span class="badge ${getStatusClass(chamado.status)}">
                    ${chamado.status || 'ABERTO'}
                </span>
            </td>
            <td>${chamado.observacoes || '-'}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="window.editarChamado('${chamado.id}')" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Renderiza paginação
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
    
    html += `
        <li class="page-item ${estadoPagina.paginaAtual === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="window.mudarPagina(${estadoPagina.paginaAtual - 1})">◄</button>
        </li>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        html += `
            <li class="page-item ${i === estadoPagina.paginaAtual ? 'active' : ''}">
                <button class="page-link" onclick="window.mudarPagina(${i})">${i}</button>
            </li>
        `;
    }

    html += `
        <li class="page-item ${estadoPagina.paginaAtual === totalPaginas ? 'disabled' : ''}">
            <button class="page-link" onclick="window.mudarPagina(${estadoPagina.paginaAtual + 1})">►</button>
        </li>
    `;

    html += '</ul>';
    container.innerHTML = html;
}

/**
 * Configura event listeners
 */
function configurarEventListeners() {
    // Botão Salvar
    const btnSalvar = document.getElementById('btnSalvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', salvarChamado);
    }

    // Botão Cancelar
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', cancelarEdicao);
    }

    // Botão Buscar
    const btnBuscar = document.getElementById('btnBuscar');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', aplicarFiltros);
    }

    // Enter na busca
    const inputBuscaNumero = document.getElementById('buscaNumero');
    if (inputBuscaNumero) {
        inputBuscaNumero.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') aplicarFiltros();
        });
    }

    // Botão Limpar
    const btnLimpar = document.getElementById('btnLimparFiltros');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', limparFiltros);
    }

    // Expor funções globais
    window.editarChamado = editarChamado;
    window.mudarPagina = mudarPagina;
}

/**
 * Salva chamado (novo ou edição)
 */
async function salvarChamado() {
    try {
        const dados = {
            analista: document.getElementById('analista').value,
            dataHora: document.getElementById('dataHora').value,
            chamado: document.getElementById('chamado').value,
            msisdn: document.getElementById('msisdn').value,
            equipamento: document.getElementById('equipamento').value,
            cenario: document.getElementById('cenario').value,
            observacoes: document.getElementById('observacoes').value,
            email: document.getElementById('email').value,
            flag: document.getElementById('flag').checked,
            tituloEmail: document.getElementById('tituloEmail').value
        };

        if (!dados.chamado) {
            mostrarErro('Número do chamado é obrigatório');
            return;
        }

        if (estadoPagina.editando && estadoPagina.chamadoEditando) {
            await chamadosService.atualizarChamado(estadoPagina.chamadoEditando, dados);
            mostrarSucesso('Chamado atualizado com sucesso!');
        } else {
            await chamadosService.criarChamado(dados);
            mostrarSucesso('Chamado criado com sucesso!');
            await gerarProximoNumero();
        }

        cancelarEdicao();
        await carregarDados();

    } catch (error) {
        console.error('Erro ao salvar chamado:', error);
        mostrarErro('Erro ao salvar chamado');
    }
}

/**
 * Cancela edição
 */
function cancelarEdicao() {
    estadoPagina.editando = false;
    estadoPagina.chamadoEditando = null;
    
    document.getElementById('formChamado').reset();
    configurarCamposAutomaticos(auth.currentUser);
    gerarProximoNumero();
    
    const btnSalvar = document.getElementById('btnSalvar');
    if (btnSalvar) {
        btnSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar';
        btnSalvar.classList.remove('btn-warning');
        btnSalvar.classList.add('btn-primary');
    }
}

/**
 * Edita chamado existente
 */
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
        
        const btnSalvar = document.getElementById('btnSalvar');
        if (btnSalvar) {
            btnSalvar.innerHTML = '<i class="fas fa-edit"></i> Atualizar';
            btnSalvar.classList.remove('btn-primary');
            btnSalvar.classList.add('btn-warning');
        }
        
        // Scroll para o formulário
        document.getElementById('formChamado').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Erro ao carregar chamado:', error);
        mostrarErro('Erro ao carregar dados do chamado');
    }
}

/**
 * Aplica filtros
 */
async function aplicarFiltros() {
    estadoPagina.filtros.numero = document.getElementById('buscaNumero')?.value || '';
    estadoPagina.filtros.msisdn = document.getElementById('buscaMSISDN')?.value || '';
    estadoPagina.filtros.cliente = document.getElementById('buscaCliente')?.value || '';
    estadoPagina.filtros.status = document.getElementById('filtroStatus')?.value || 'TODOS';
    estadoPagina.filtros.dataInicial = document.getElementById('dataInicial')?.value || '';
    estadoPagina.filtros.dataFinal = document.getElementById('dataFinal')?.value || '';

    await carregarDados();
}

/**
 * Limpa filtros
 */
function limparFiltros() {
    document.getElementById('buscaNumero').value = '';
    document.getElementById('buscaMSISDN').value = '';
    document.getElementById('buscaCliente').value = '';
    document.getElementById('filtroStatus').value = 'TODOS';
    document.getElementById('dataInicial').value = '';
    document.getElementById('dataFinal').value = '';
    
    aplicarFiltros();
}

/**
 * Muda página
 */
function mudarPagina(pagina) {
    const totalPaginas = Math.ceil(estadoPagina.chamados.length / estadoPagina.itensPorPagina);
    
    if (pagina < 1 || pagina > totalPaginas) return;

    estadoPagina.paginaAtual = pagina;
    renderizarTabela();
    renderizarPaginacao();
}

/**
 * Configura logout
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

// Funções auxiliares
function formatarDataHora(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, '0');
    const min = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${hora}:${min}`;
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
    if (spinner) {
        spinner.style.display = mostrar ? 'block' : 'none';
    }
}

function mostrarErro(mensagem) {
    alert('❌ ' + mensagem);
}

function mostrarSucesso(mensagem) {
    alert('✅ ' + mensagem);
}
