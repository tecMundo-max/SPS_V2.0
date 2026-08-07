import { sessionManager } from '../core/session.js';
import appContext from '../core/appContext.js';
import { chamadosService } from '../services/chamadosService.js';
import { authService } from '../services/authService.js';

// Inicialização da página
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    const autenticado = await sessionManager.requireAuth();
    if (!autenticado) return;

    // Configurar UI
    configurarUI();
    
    // Carregar listas
    await carregarDropdowns();
    
    // Atualizar data/hora
    atualizarDataHora();
    setInterval(atualizarDataHora, 1000);
    
    // Carregar chamados iniciais
    await pesquisar();
    
    // Event listeners
    configurarEventListeners();
});

// Configurar interface
function configurarUI() {
    // Informações do usuário
    document.getElementById('userInfo').textContent = 
        `${appContext.getUsername()} (${appContext.getRole()})`;
    
    // Mostrar menus de admin
    if (appContext.isAdmin) {
        document.getElementById('menuUsuarios').style.display = 'block';
        document.getElementById('menuConfig').style.display = 'block';
    }
    
    // Campo analista
    document.getElementById('analista').value = appContext.getUsername();
}

// Carregar dropdowns
async function carregarDropdowns() {
    const listas = await chamadosService.carregarListas();
    
    // Equipamentos
    const selectEquipamento = document.getElementById('equipamento');
    const editEquipamento = document.getElementById('editEquipamento');
    listas.equipamentos?.forEach(eq => {
        selectEquipamento.innerHTML += `<option value="${eq}">${eq}</option>`;
        editEquipamento.innerHTML += `<option value="${eq}">${eq}</option>`;
    });
    
    // Cenários
    const selectCenario = document.getElementById('cenario');
    const editCenario = document.getElementById('editCenario');
    listas.cenarios?.forEach(cen => {
        selectCenario.innerHTML += `<option value="${cen}">${cen}</option>`;
        editCenario.innerHTML += `<option value="${cen}">${cen}</option>`;
    });
}

// Atualizar data/hora
function atualizarDataHora() {
    const agora = new Date();
    document.getElementById('dataHora').value = 
        agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
}

// Configurar eventos
function configurarEventListeners() {
    // Formulário de inclusão
    document.getElementById('formChamado').addEventListener('submit', async (e) => {
        e.preventDefault();
        await salvarChamado();
    });
}

// Salvar chamado
async function salvarChamado() {
    const dados = {
        chamado: document.getElementById('chamado').value,
        linha: document.getElementById('linha').value,
        equipamento: document.getElementById('equipamento').value,
        cenario: document.getElementById('cenario').value,
        observacoes: document.getElementById('observacoes').value,
        email: document.getElementById('email').value,
        flag: document.getElementById('flag').checked,
        titulo: document.getElementById('titulo').value
    };

    const resultado = await chamadosService.criarChamado(dados);
    
    if (resultado.success) {
        alert('Chamado criado com sucesso!');
        limparFormulario();
        await pesquisar();
    } else {
        alert('Erro ao criar chamado: ' + resultado.error);
    }
}

// Pesquisar chamados
async function pesquisar() {
    const filtros = {
        dataInicial: document.getElementById('dataInicial').value ? 
            new Date(document.getElementById('dataInicial').value).getTime() : null,
        dataFinal: document.getElementById('dataFinal').value ? 
            new Date(document.getElementById('dataFinal').value + 'T23:59:59').getTime() : null,
        analista: document.getElementById('filtroAnalista').value,
        chamado: document.getElementById('filtroChamado').value,
        linha: document.getElementById('filtroLinha').value
    };

    const resultado = await chamadosService.pesquisarChamados(filtros);
    
    if (resultado.success) {
        atualizarTabela(resultado.chamados);
        document.getElementById('totalRegistros').textContent = resultado.total;
        
        // Mostrar/ocultar botão "Mostrar Mais"
        document.getElementById('botaoMostrarMais').style.display = 
            chamadosService.temMaisRegistros ? 'block' : 'none';
    }
}

// Atualizar tabela
function atualizarTabela(chamados) {
    const tbody = document.getElementById('corpoTabela');
    
    if (chamados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum chamado encontrado</td></tr>';
        return;
    }
    
    // Cores por analista
    const cores = gerarCoresPorAnalista(chamados);
    
    tbody.innerHTML = chamados.map(chamado => {
        const cor = cores[chamado.analista] || '#ffffff';
        return `
            <tr style="background-color: ${cor}15; border-left: 4px solid ${cor}">
                <td>${chamadosService.formatarData(chamado.createdAt)}</td>
                <td><strong>${chamado.analista}</strong></td>
                <td>${chamado.chamado}</td>
                <td>${chamado.linha}</td>
                <td>${chamado.equipamento || '-'}</td>
                <td>${chamado.cenario || '-'}</td>
                <td>${chamado.titulo || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editarChamado('${chamado.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${appContext.isAdmin ? `
                        <button class="btn btn-sm btn-danger" onclick="excluirChamado('${chamado.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Gerar cores por analista
function gerarCoresPorAnalista(chamados) {
    const cores = {};
    const paleta = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
                    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    
    const analistas = [...new Set(chamados.map(c => c.analista))];
    analistas.forEach((analista, index) => {
        cores[analista] = paleta[index % paleta.length];
    });
    
    return cores;
}

// Editar chamado
window.editarChamado = async function(id) {
    // Buscar dados do chamado
    const snapshot = await database.ref(`CHAMADOS/${id}`).once('value');
    const chamado = snapshot.val();
    
    if (chamado) {
        document.getElementById('editId').value = id;
        document.getElementById('editChamado').value = chamado.chamado || '';
        document.getElementById('editLinha').value = chamado.linha || '';
        document.getElementById('editEquipamento').value = chamado.equipamento || '';
        document.getElementById('editCenario').value = chamado.cenario || '';
        document.getElementById('editEmail').value = chamado.email || '';
        document.getElementById('editTitulo').value = chamado.titulo || '';
        document.getElementById('editObservacoes').value = chamado.observacoes || '';
        
        const modal = new bootstrap.Modal(document.getElementById('modalEdicao'));
        modal.show();
    }
};

// Salvar edição
window.salvarEdicao = async function() {
    const id = document.getElementById('editId').value;
    const dados = {
        chamado: document.getElementById('editChamado').value,
        linha: document.getElementById('editLinha').value,
        equipamento: document.getElementById('editEquipamento').value,
        cenario: document.getElementById('editCenario').value,
        email: document.getElementById('editEmail').value,
        titulo: document.getElementById('editTitulo').value,
        observacoes: document.getElementById('editObservacoes').value,
        updatedAt: Date.now()
    };
    
    const resultado = await chamadosService.atualizarChamado(id, dados);
    
    if (resultado.success) {
        alert('Chamado atualizado com sucesso!');
        bootstrap.Modal.getInstance(document.getElementById('modalEdicao')).hide();
        await pesquisar();
    } else {
        alert('Erro ao atualizar: ' + resultado.error);
    }
};

// Excluir chamado
window.excluirChamado = async function(id) {
    if (!appContext.isAdmin) {
        alert('Apenas supervisores podem excluir chamados!');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir este chamado?')) {
        const resultado = await chamadosService.excluirChamado(id);
        
        if (resultado.success) {
            alert('Chamado excluído com sucesso!');
            await pesquisar();
        } else {
            alert('Erro ao excluir: ' + resultado.error);
        }
    }
};

// Carregar mais
window.carregarMais = async function() {
    const tbody = document.getElementById('corpoTabela');
    const ultimoRegistro = tbody.lastElementChild;
    // Implementar lógica de carregar mais
    alert('Funcionalidade em desenvolvimento');
};

// Filtrar hoje
window.filtrarHoje = function() {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataInicial').value = hoje;
    document.getElementById('dataFinal').value = hoje;
    pesquisar();
};

// Limpar formulário
window.limparFormulario = function() {
    document.getElementById('formChamado').reset();
    document.getElementById('analista').value = appContext.getUsername();
    atualizarDataHora();
};

// Limpar filtros
window.limparFiltros = function() {
    document.getElementById('dataInicial').value = '';
    document.getElementById('dataFinal').value = '';
    document.getElementById('filtroAnalista').value = '';
    document.getElementById('filtroChamado').value = '';
    document.getElementById('filtroLinha').value = '';
    pesquisar();
};

// Logout
window.logout = async function() {
    await sessionManager.logout();
    window.location.href = 'login.html';
};

// Exportar funções globais
window.pesquisar = pesquisar;
