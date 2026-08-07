// js/services/chamadosService.js
import { database } from '../config/firebase.js';
import { ref, get, set, update, push, query, orderByChild, equalTo } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

export const chamadosService = {
    /**
     * Lista todos os chamados ativos
     */
    async listarChamados() {
        try {
            const chamadosRef = ref(database, 'chamados');
            const snapshot = await get(chamadosRef);
            
            if (!snapshot.exists()) {
                return [];
            }

            const chamados = [];
            snapshot.forEach((childSnapshot) => {
                const chamado = childSnapshot.val();
                if (chamado.ativo !== false) {
                    chamados.push({
                        id: childSnapshot.key,
                        ...chamado
                    });
                }
            });

            // Ordenar por data de criação (mais recente primeiro)
            return chamados.sort((a, b) => {
                const dateA = new Date(b.criadoEm || 0);
                const dateB = new Date(a.criadoEm || 0);
                return dateA - dateB;
            });
        } catch (error) {
            console.error('Erro ao listar chamados:', error);
            throw error;
        }
    },

    /**
     * Busca um chamado específico
     */
    async buscarChamado(id) {
        try {
            const chamadoRef = ref(database, `chamados/${id}`);
            const snapshot = await get(chamadoRef);
            
            if (!snapshot.exists()) {
                throw new Error('Chamado não encontrado');
            }

            return {
                id: snapshot.key,
                ...snapshot.val()
            };
        } catch (error) {
            console.error('Erro ao buscar chamado:', error);
            throw error;
        }
    },

    /**
     * Cria um novo chamado
     */
    async criarChamado(dados) {
        try {
            const chamadosRef = ref(database, 'chamados');
            const novoChamadoRef = push(chamadosRef);
            
            const chamado = {
                numero: await this.gerarNumero(),
                cliente: dados.cliente || '',
                linha: dados.linha || '',
                status: 'ABERTO',
                fila: dados.fila || 'GERAL',
                analista: dados.analista || '',
                observacao: dados.observacao || '',
                criadoPor: dados.criadoPor || '',
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString(),
                ultimaAtualizacao: new Date().toLocaleString('pt-BR'),
                ativo: true
            };

            await set(novoChamadoRef, chamado);
            
            return {
                id: novoChamadoRef.key,
                ...chamado
            };
        } catch (error) {
            console.error('Erro ao criar chamado:', error);
            throw error;
        }
    },

    /**
     * Atualiza um chamado existente
     */
    async atualizarChamado(id, dados) {
        try {
            const chamadoRef = ref(database, `chamados/${id}`);
            
            const atualizacao = {
                ...dados,
                atualizadoEm: new Date().toISOString(),
                ultimaAtualizacao: new Date().toLocaleString('pt-BR')
            };

            await update(chamadoRef, atualizacao);
            
            return {
                id,
                ...atualizacao
            };
        } catch (error) {
            console.error('Erro ao atualizar chamado:', error);
            throw error;
        }
    },

    /**
     * Gera número sequencial para o chamado
     */
    async gerarNumero() {
        try {
            const chamadosRef = ref(database, 'chamados');
            const snapshot = await get(chamadosRef);
            
            if (!snapshot.exists()) {
                return '00001';
            }

            let maiorNumero = 0;
            snapshot.forEach((childSnapshot) => {
                const chamado = childSnapshot.val();
                const numero = parseInt(chamado.numero || '0');
                if (numero > maiorNumero) {
                    maiorNumero = numero;
                }
            });

            return String(maiorNumero + 1).padStart(5, '0');
        } catch (error) {
            console.error('Erro ao gerar número:', error);
            throw error;
        }
    },

    /**
     * Busca chamados com filtros
     */
    async buscarChamadosComFiltros(filtros = {}) {
        try {
            const chamados = await this.listarChamados();
            
            return chamados.filter(chamado => {
                let atendeFiltro = true;

                // Filtro por data inicial
                if (filtros.dataInicial) {
                    const dataChamado = new Date(chamado.criadoEm);
                    const dataInicial = new Date(filtros.dataInicial);
                    if (dataChamado < dataInicial) atendeFiltro = false;
                }

                // Filtro por data final
                if (filtros.dataFinal) {
                    const dataChamado = new Date(chamado.criadoEm);
                    const dataFinal = new Date(filtros.dataFinal);
                    dataFinal.setHours(23, 59, 59, 999);
                    if (dataChamado > dataFinal) atendeFiltro = false;
                }

                // Filtro por status
                if (filtros.status && filtros.status !== 'TODOS') {
                    if (chamado.status !== filtros.status) atendeFiltro = false;
                }

                // Filtro por analista
                if (filtros.analista) {
                    const termoBusca = filtros.analista.toLowerCase();
                    if (!chamado.analista.toLowerCase().includes(termoBusca)) {
                        atendeFiltro = false;
                    }
                }

                // Filtro por termo de busca
                if (filtros.termoBusca) {
                    const termo = filtros.termoBusca.toLowerCase();
                    const encontrouNoCliente = chamado.cliente.toLowerCase().includes(termo);
                    const encontrouNaLinha = chamado.linha.toLowerCase().includes(termo);
                    const encontrouNoNumero = chamado.numero.includes(termo);
                    
                    if (!encontrouNoCliente && !encontrouNaLinha && !encontrouNoNumero) {
                        atendeFiltro = false;
                    }
                }

                return atendeFiltro;
            });
        } catch (error) {
            console.error('Erro ao buscar chamados com filtros:', error);
            throw error;
        }
    },

    /**
     * Obtém estatísticas dos chamados
     */
    async obterEstatisticas() {
        try {
            const chamados = await this.listarChamados();
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            return {
                total: chamados.length,
                abertos: chamados.filter(c => c.status === 'ABERTO').length,
                emAndamento: chamados.filter(c => c.status === 'EM_ANDAMENTO').length,
                fechados: chamados.filter(c => c.status === 'FECHADO').length,
                hoje: chamados.filter(c => {
                    const dataCriacao = new Date(c.criadoEm);
                    dataCriacao.setHours(0, 0, 0, 0);
                    return dataCriacao.getTime() === hoje.getTime();
                }).length
            };
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            throw error;
        }
    }
};
