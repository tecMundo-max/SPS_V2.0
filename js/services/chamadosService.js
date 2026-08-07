import { database } from '../firebase/config.js';
import appContext from '../core/appContext.js';

// Serviço de Chamados
class ChamadosService {
    constructor() {
        this.listaChamados = [];
        this.ultimaChave = null;
        this.temMaisRegistros = true;
    }

    // Carregar listas (equipamentos e cenários)
    async carregarListas() {
        try {
            const snapshot = await database.ref('LISTAS').once('value');
            return snapshot.val() || { equipamentos: [], cenarios: [] };
        } catch (error) {
            console.error('Erro ao carregar listas:', error);
            return { equipamentos: [], cenarios: [] };
        }
    }

    // Criar novo chamado
    async criarChamado(dados) {
        try {
            const chamadoData = {
                ...dados,
                createdAt: Date.now(),
                deleted: false,
                isDuplicate: false,
                analista: appContext.getUsername(),
                usuarioId: appContext.currentUser?.uid
            };

            const newRef = database.ref('CHAMADOS').push();
            await newRef.set(chamadoData);
            
            // Atualizar contador de linhas
            await this.atualizarContadorLinhas(dados.linha);
            
            return { success: true, id: newRef.key };
        } catch (error) {
            console.error('Erro ao criar chamado:', error);
            return { success: false, error: error.message };
        }
    }

    // Atualizar chamado
    async atualizarChamado(id, dados) {
        try {
            await database.ref(`CHAMADOS/${id}`).update(dados);
            return { success: true };
        } catch (error) {
            console.error('Erro ao atualizar chamado:', error);
            return { success: false, error: error.message };
        }
    }

    // Soft delete
    async excluirChamado(id) {
        try {
            if (!appContext.isAdmin) {
                return { success: false, error: 'Apenas supervisores podem excluir' };
            }
            await database.ref(`CHAMADOS/${id}`).update({ deleted: true });
            return { success: true };
        } catch (error) {
            console.error('Erro ao excluir chamado:', error);
            return { success: false, error: error.message };
        }
    }

    // Pesquisar chamados
    async pesquisarChamados(filtros = {}, limite = 20) {
        try {
            let query = database.ref('CHAMADOS').orderByChild('createdAt');
            
            const snapshot = await query.once('value');
            const chamados = [];
            
            snapshot.forEach((child) => {
                const chamado = { id: child.key, ...child.val() };
                
                // Filtrar deletados
                if (chamado.deleted && !appContext.isAdmin) return;
                
                // Aplicar filtros
                if (this.aplicarFiltros(chamado, filtros)) {
                    chamados.push(chamado);
                }
            });

            // Ordenar por data (mais recentes primeiro)
            chamados.sort((a, b) => b.createdAt - a.createdAt);
            
            // Paginação
            const resultado = chamados.slice(0, limite);
            this.temMaisRegistros = chamados.length > limite;
            
            return { success: true, chamados: resultado, total: chamados.length };
        } catch (error) {
            console.error('Erro ao pesquisar chamados:', error);
            return { success: false, error: error.message, chamados: [], total: 0 };
        }
    }

    // Carregar mais registros
    async carregarMais(inicio, limite = 20) {
        // Implementar lógica de paginação com base no último registro
        const snapshot = await database.ref('CHAMADOS')
            .orderByChild('createdAt')
            .endAt(inicio - 1)
            .limitToLast(limite)
            .once('value');
        
        const chamados = [];
        snapshot.forEach((child) => {
            chamados.push({ id: child.key, ...child.val() });
        });
        
        return chamados.reverse();
    }

    // Atualizar contador de linhas
    async atualizarContadorLinhas(linha) {
        try {
            const ref = database.ref(`CONTADOR_LINHAS/${linha}`);
            const snapshot = await ref.once('value');
            const dados = snapshot.val() || { count: 0 };
            
            await ref.set({
                count: (dados.count || 0) + 1,
                lastAt: Date.now()
            });
        } catch (error) {
            console.error('Erro ao atualizar contador:', error);
        }
    }

    // Aplicar filtros
    aplicarFiltros(chamado, filtros) {
        if (filtros.chamado && !chamado.chamado?.toLowerCase().includes(filtros.chamado.toLowerCase())) {
            return false;
        }
        if (filtros.linha && !chamado.linha?.includes(filtros.linha)) {
            return false;
        }
        if (filtros.analista && !chamado.analista?.toLowerCase().includes(filtros.analista.toLowerCase())) {
            return false;
        }
        if (filtros.dataInicial && chamado.createdAt < filtros.dataInicial) {
            return false;
        }
        if (filtros.dataFinal && chamado.createdAt > filtros.dataFinal) {
            return false;
        }
        return true;
    }

    // Formatar data
    formatarData(timestamp) {
        if (!timestamp) return '';
        const data = new Date(timestamp);
        return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
    }
}

export const chamadosService = new ChamadosService();
