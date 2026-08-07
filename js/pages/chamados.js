import { sessionManager } from '../core/session.js';
import appContext from '../core/appContext.js';
import { chamadosService } from '../services/chamadosService.js';
import { authService } from '../services/authService.js';
import { testarConexao, criarEstruturaInicial, verificarAuth } from '../testConnection.js';

// Inicialização da página
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando página de Chamados...');
    
    // Teste de conexão primeiro
    const conectado = await testarConexao();
    if (!conectado) {
        console.error('❌ Falha na conexão com Firebase. Verifique:');
        console.error('1. Se o arquivo config.js está correto');
        console.error('2. Se as regras do Firebase permitem leitura');
        console.error('3. Se a URL do database está correta');
        alert('Erro de conexão com o banco de dados. Verifique o console (F12).');
        return;
    }
    
    // Verificar autenticação (modo desenvolvimento)
    let autenticado = await verificarAuth();
    
    if (!autenticado) {
        console.warn('⚠️ Modo desenvolvimento: sem autenticação');
        // Em desenvolvimento, podemos continuar sem autenticação
        appContext.setUser({ email: 'dev@teste.com', uid: 'dev-mode' });
        appContext.setUserProfile({ 
            admin: true, 
            role: 'SUPERVISOR', 
            username: 'Desenvolvedor',
            ativo: true 
        });
    }
    
    // Configurar UI
    configurarUI();
    
    // Carregar listas
    const listasCarregadas = await carregarDropdowns();
    if (!listasCarregadas) {
        console.warn('⚠️ Listas não carregadas, tentando criar estrutura...');
        await criarEstruturaInicial();
        await carregarDropdowns();
    }
    
    // Atualizar data/hora
    atualizarDataHora();
    setInterval(atualizarDataHora, 1000);
    
    // Carregar chamados iniciais
    await pesquisar();
    
    // Event listeners
    configurarEventListeners();
    
    console.log('✅ Página inicializada com sucesso!');
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
    try {
        console.log('📋 Carregando listas...');
        const listas = await chamadosService.carregarListas();
        
        if (!listas || (!listas.equipamentos && !listas.cenarios)) {
            console.warn('⚠️ Listas vazias ou não encontradas');
            return false;
        }
        
        console.log('✅ Listas carregadas:', listas);
        
        // Equipamentos
        const selectEquipamento = document.getElementById('equipamento');
        const editEquipamento = document.getElementById('editEquipamento');
        
        // Limpar opções existentes (mantém o primeiro "Selecione...")
        selectEquipamento.innerHTML = '<option value="">Selecione...</option>';
        editEquipamento.innerHTML = '<option value="">Selecione...</option>';
        
        if (listas.equipamentos && Array.isArray(listas.equipamentos)) {
            listas.equipamentos.forEach(eq => {
                selectEquipamento.innerHTML += `<option value="${eq}">${eq}</option>`;
                editEquipamento.innerHTML += `<option value="${eq}">${eq}</option>`;
            });
            console.log(`🔧 ${listas.equipamentos.length} equipamentos carregados`);
        }
        
        // Cenários
        const selectCenario = document.getElementById('cenario');
        const editCenario = document.getElementById('editCenario');
        
        // Limpar opções existentes
        selectCenario.innerHTML = '<option value="">Selecione...</option>';
        editCenario.innerHTML = '<option value="">Selecione...</option>';
        
        if (listas.cenarios && Array.isArray(listas.cenarios)) {
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

// ... resto do código permanece igual ...
