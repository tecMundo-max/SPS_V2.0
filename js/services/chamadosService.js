// js/services/chamadosService.js
import { db } from '../config/firebase.js';
import { ref, get, set, update, push } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

export const chamadosService = {
    /**
     * Busca listas de equipamentos e cenários
     */
    async buscarListas() {
        try {
            const listasRef = ref(db, 'listas');
            const snapshot = await get(listasRef);
            
            if (snapshot.exists()) {
                return snapshot.val();
            }
            
            return {
                equipamentos: [],
                cenarios: []
            };
        } catch (error) {
            console.error('Erro ao buscar listas:', error);
            throw error;
        }
    },

    /**
     * Gera próximo número de chamado
     */
    async gerarNumeroChamado() {
        try {
            const chamadosRef = ref(db, 'chamados');
            const snapshot = await get(chamadosRef);
            
            if (!snapshot.exists()) {
                return '00001';
            }

            let maiorNumero = 0;
            snapshot.forEach((childSnapshot) => {
                const chamado = childSnapshot.val();
                const numero = parseInt(chamado.numero || chamado.chamado || '0');
                if (!isNaN(numero) && numero > maiorNumero) {
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
     * Lista todos os chamados
     */
    async listarChamados() {
        try {
            const chamadosRef = ref(db, 'chamados');
            const snapshot = await get(chamadosRef);
            
            if (!snapshot.exists()) {
                return [];
            }

            const chamados = [];
            snapshot.forEach((childSnapshot) => {
                chamados.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            // Ordenar por data (mais recente primeiro)
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
     * Criar novo chamado
     */
    async criarChamado(dados) {
        try {
            const chamadosRef = ref(db, 'chamados');
            const novoChamadoRef = push(chamadosRef);
            
            const numero = await this.gerarNumeroChamado();
            
            const chamado = {
                numero: numero,
                analista: dados.analista || '',
                dataHora: dados.dataHora || new Date().toLocaleString('pt-BR'),
                chamado: numero,
                msisdn: dados.msisdn || '',
                equipamento: dados.equipamento || '',
                cenario: dados.cenario || '',
                observacoes: dados.observacoes || '',
                email: dados.email || '',
                flag: dados.flag || false,
                tituloEmail: dados.tituloEmail || '',
                status: dados.status || 'ABERTO',
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            };

            await set(novoChamadoRef, chamado);
            
            console.log('✅ Chamado criado:', chamado);
            
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
     * Atualizar chamado
     */
    async atualizarChamado(id, dados) {
        try {
            const chamadoRef = ref(db, `chamados/${id}`);
            
            const atualizacao = {
                ...dados,
                atualizadoEm: new Date().toISOString(),
                dataHora: dados.dataHora || new Date().toLocaleString('pt-BR')
            };

            await update(chamadoRef, atualizacao);
            
            console.log('✅ Chamado atualizado:', id);
            
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
     * Buscar chamados com filtros
     */
    async buscarChamadosComFiltros(filtros = {}) {
        try {
            const chamados = await this.listarChamados();
            
            return chamados.filter(chamado => {
                let atendeFiltro = true;

                if (filtros.numero) {
                    const numeroChamado = chamado.numero || chamado.chamado || '';
                    if (!numeroChamado.includes(filtros.numero)) atendeFiltro = false;
                }

                if (filtros.msisdn) {
                    const msisdnLimpo = (chamado.msisdn || '').replace(/\D/g, '');
                    const filtroLimpo = filtros.msisdn.replace(/\D/g, '');
                    if (!msisdnLimpo.includes(filtroLimpo)) atendeFiltro = false;
                }

                if (filtros.cliente) {
                    const termo = filtros.cliente.toLowerCase();
                    const email = (chamado.email || '').toLowerCase();
                    if (!email.includes(termo)) atendeFiltro = false;
                }

                if (filtros.status && filtros.status !== 'TODOS') {
                    if (chamado.status !== filtros.status) atendeFiltro = false;
                }

                if (filtros.dataInicial) {
                    const dataChamado = new Date(chamado.criadoEm || 0);
                    const dataInicial = new Date(filtros.dataInicial);
                    if (dataChamado < dataInicial) atendeFiltro = false;
                }

                if (filtros.dataFinal) {
                    const dataChamado = new Date(chamado.criadoEm || 0);
                    const dataFinal = new Date(filtros.dataFinal);
                    dataFinal.setHours(23, 59, 59, 999);
                    if (dataChamado > dataFinal) atendeFiltro = false;
                }

                return atendeFiltro;
            });
        } catch (error) {
            console.error('Erro ao buscar chamados com filtros:', error);
            throw error;
        }
    },

    /**
     * Obter estatísticas
     */
    async obterEstatisticas() {
        try {
            const chamados = await this.listarChamados();
            
            return {
                aberto: chamados.filter(c => c.status === 'ABERTO').length,
                execucao: chamados.filter(c => c.status === 'EXECUCAO').length,
                aguardando: chamados.filter(c => c.status === 'AGUARDANDO').length,
                finalizado: chamados.filter(c => c.status === 'FINALIZADO').length
            };
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            throw error;
        }
    },

    /**
     * Buscar chamado por ID
     */
    async buscarChamado(id) {
        try {
            const chamadoRef = ref(db, `chamados/${id}`);
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
    }
};
