import { sessionManager } from '../core/session.js';
import appContext from '../core/appContext.js';
import { chamadosService } from '../services/chamadosService.js';
import { authService } from '../services/authService.js';

// Inicialização da página
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando página de Chamados...');
    
    // Configurar modo desenvolvimento
    configurarModoDev();
    
    // Configurar UI
    configurarUI();
    
    // Carregar listas (cria automaticamente se não existir)
    console.log('📋 Carregando listas...');
    await carregarDropdowns();
    
    // Atualizar data/hora
    atualizarDataHora();
    setInterval(atualizarDataHora, 1000);
    
    // Carregar chamados iniciais
    await pesquisar();
    
    // Event listeners
    configurarEventListeners();
    
    console.log('✅ Página inicializada com sucesso!');
});

// Modo desenvolvimento (sem autenticação)
function configurarModoDev() {
    if (!appContext.isAuthenticated) {
        console.log('🔧 Modo desenvolvimento ativado');
        appContext.setUser({ 
            email: 'dev@sps.com', 
            uid: 'dev-mode-' + Date.now() 
        });
        appContext.setUserProfile({ 
            admin: true, 
            role: 'SUPERVISOR', 
            username: 'Desenvolvedor',
            ativo: true 
        });
    }
}

// Configurar interface
function configurarUI() {
    document.getElementById('userInfo').textContent = 
        `${appContext.getUsername()} (${appContext.getRole()})`;
    
    if (appContext.isAdmin) {
        document.getElementById('menuUsuarios').style.display = 'block';
        document.getElementById('menuConfig').style.display = 'block';
    }
    
    document.getElementById('analista').value = appContext.getUsername();
}

// Carregar dropdowns
async function carregarDropdowns() {
    try {
        const listas = await chamadosService.carregarListas();
        console.log('✅ Listas carregadas:', listas);
        
        // Preencher equipamentos
        const selectEquipamento = document.getElementById('equipamento');
        const editEquipamento = document.getElementById('editEquipamento');
        
        if (listas.equipamentos && Array.isArray(listas.equipamentos)) {
            selectEquipamento.innerHTML = '<option value="">Selecione...</option>';
            editEquipamento.innerHTML = '<option value="">Selecione...</option>';
            
            listas.equipamentos.forEach(eq => {
                selectEquipamento.innerHTML += `<option value="${eq}">${eq}</option>`;
                editEquipamento.innerHTML += `<option value="${eq}">${eq}</option>`;
            });
            
            console.log(`🔧 ${listas.equipamentos.length} equipamentos carregados`);
        }
        
        // Preencher cenários
        const selectCenario = document.getElementById('cenario');
        const editCenario = document.getElementById('editCenario');
        
        if (listas.cenarios && Array.isArray(listas.cenarios)) {
            selectCenario.innerHTML = '<option value="">Selecione...</option>';
            editCenario.innerHTML = '<option value="">Selecione...</option>';
            
            listas.cenarios.forEach(cen => {
                selectCenario.innerHTML += `<option value="${cen}">${cen}</option>`;
                editCenario.innerHTML += `<option value="${cen}">${cen}</option>`;
            });
            
            console.log(`🎯 ${listas.cenarios.length} cenários carregados`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao carregar dropdowns:', error);
        return false;
    }
}

// Atualizar data/hora
function atualizarDataHora() {
    const agora = new Date();
    document.getElementById('dataHora').value = 
        agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
}

// Configurar eventos
function configurarEventListeners() {
    document.getElementById('formChamado').addEventListener('submit', async (e) => {
        e.preventDefault();
        await salvarChamado();
    });
}

// Salvar chamado
async function salvarChamado() {
    const dados = {
        chamado: document.getElementById('chamado').value.trim(),
        linha: document.getElementById('linha').value.trim(),
        equipamento: document.getElementById('equipamento').value,
        cenario: document.getElementById('cenario').value,
        observacoes: document.getElementById('observacoes').value.trim(),
        email: document.getElementById('email').value.trim(),
        flag: document.getElementById('flag').checked,
        titulo: document.getElementById('titulo').value.trim()
    };

    // Validação básica
    if (!dados.chamado || !dados.linha) {
        alert('Preencha os campos obrigatórios (Chamado e Linha)!');
        return;
    }

    console.log('💾 Salvando chamado:', dados);
    const resultado = await chamadosService.criarChamado(dados);
    
    if (resultado.success) {
        alert('✅ Chamado criado com sucesso!');
        limparFormulario();
        await pesquisar();
    } else {
        alert('❌ Erro ao criar chamado: ' + resultado.error);
    }
}

// Pesquisar chamados
async function pesquisar() {
    console.log('🔍 Iniciando pesquisa...');
    
    const filtros = {
        dataInicial: document.getElementById('dataInicial').value ? 
            new Date(document.getElementById('dataInicial').value).getTime() : null,
        dataFinal: document.getElementById('dataFinal').value ? 
            new Date(document.getElementById('dataFinal').value + 'T23:59:59').getTime() : null,
        analista: document.getElementById('filtroAnalista').value.trim(),
        chamado: document.getElementById('filtroChamado').value.trim(),
        linha: document.getElementById('filtroLinha').value.trim()
    };

    const resultado = await chamadosService.pesquisarChamados(filtros);
    
    if (resultado.success) {
        atualizarTabela(resultado.chamados);
        document.getElementById('totalRegistros').textContent = resultado.total;
        
        document.getElementById('botaoMostrarMais').style.display = 
            chamadosService.temMaisRegistros ? 'block' : 'none';
    } else {
        console.error('Erro na pesquisa:', resultado.error);
        document.getElementById('corpoTabela').innerHTML = 
            '<tr><td colspan="8" class="text-center text-danger">Erro ao carregar chamados</td></tr>';
    }
}

// Atualizar tabela
function atualizarTabela(chamados) {
    const tbody = document.getElementById('corpoTabela');
    
    if (!chamados || chamados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                    <p>Nenhum chamado encontrado</p>
                    <small>Use o formulário acima para criar o primeiro chamado</small>
                </td>
            </tr>`;
        return;
    }
    
    // Cores por analista
    const cores = gerarCoresPorAnalista(chamados);
    
    tbody.innerHTML = chamados.map(chamado => {
        const cor = cores[chamado.analista] || '#6c757d';
        return `
            <tr style="background-color: ${cor}10; border-left: 4px solid ${cor}">
                <td><small>${chamadosService.formatarData(chamado.createdAt)}</small></td>
                <td><span class="badge" style="background-color: ${cor}">${chamado.analista || '-'}</span></td>
                <td><strong>${chamado.chamado || '-'}</strong></td>
                <td>${chamado.linha || '-'}</td>
                <td>${chamado.equipamento || '-'}</td>
                <td>${chamado.cenario || '-'}</td>
                <td>${chamado.titulo || '-'}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-warning" onclick="editarChamado('${chamado.id}')" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        ${appContext.isAdmin ? `
                            <button class="btn btn-outline-danger" onclick="excluirChamado('${chamado.id}')" title="Excluir">
                                <i class="bi bi-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Gerar cores por analista
function gerarCoresPorAnalista(chamados) {
    const cores = {};
    const paleta = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F06292', '#AED581', '#FFD54F', '#4FC3F7', '#7986CB'
    ];
    
    const analistas = [...new Set(chamados.map(c => c.analista).filter(Boolean))];
    analistas.forEach((analista, index) => {
        cores[analista] = paleta[index % paleta.length];
    });
    
    return cores;
}

// Funções globais
window.editarChamado = async function(id) {
    console.log('✏️ Editando chamado:', id);
    
    try {
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
    } catch (error) {
        console.error('Erro ao carregar chamado:', error);
        alert('Erro ao carregar dados do chamado');
    }
};

window.salvarEdicao = async function() {
    const id = document.getElementById('editId').value;
    const dados = {
        chamado: document.getElementById('editChamado').value.trim(),
        linha: document.getElementById('editLinha').value.trim(),
        equipamento: document.getElementById('editEquipamento').value,
        cenario: document.getElementById('editCenario').value,
        email: document.getElementById('editEmail').value.trim(),
        titulo: document.getElementById('editTitulo').value.trim(),
        observacoes: document.getElementById('editObservacoes').value.trim(),
        updatedAt: Date.now()
    };
    
    console.log('💾 Salvando edição:', id, dados);
    const resultado = await chamadosService.atualizarChamado(id, dados);
    
    if (resultado.success) {
        alert('✅ Chamado atualizado com sucesso!');
        bootstrap.Modal.getInstance(document.getElementById('modalEdicao')).hide();
        await pesquisar();
    } else {
        alert('❌ Erro ao atualizar: ' + resultado.error);
    }
};

window.excluirChamado = async function(id) {
    if (!appContext.isAdmin) {
        alert('⛔ Apenas supervisores podem excluir chamados!');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir este chamado? Esta ação é reversível.')) {
        console.log('🗑️ Excluindo chamado:', id);
        const resultado = await chamadosService.excluirChamado(id);
        
        if (resultado.success) {
            alert('✅ Chamado excluído com sucesso!');
            await pesquisar();
        } else {
            alert('❌ Erro ao excluir: ' + resultado.error);
        }
    }
};

window.carregarMais = function() {
    const tbody = document.getElementById('corpoTabela');
    const ultimoId = tbody.lastElementChild?.dataset?.id;
    
    if (ultimoId) {
        // Implementar carregamento progressivo
        console.log('📄 Carregando mais registros...');
        alert('Funcionalidade em desenvolvimento');
    }
};

window.filtrarHoje = function() {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataInicial').value = hoje;
    document.getElementById('dataFinal').value = hoje;
    pesquisar();
};

window.limparFormulario = function() {
    document.getElementById('formChamado').reset();
    document.getElementById('analista').value = appContext.getUsername();
    atualizarDataHora();
};

window.limparFiltros = function() {
    document.getElementById('dataInicial').value = '';
    document.getElementById('dataFinal').value = '';
    document.getElementById('filtroAnalista').value = '';
    document.getElementById('filtroChamado').value = '';
    document.getElementById('filtroLinha').value = '';
    pesquisar();
};

window.logout = function() {
    if (confirm('Deseja sair do sistema?')) {
        window.location.href = 'login.html';
    }
};

// Tornar funções disponíveis globalmente
window.pesquisar = pesquisar;
