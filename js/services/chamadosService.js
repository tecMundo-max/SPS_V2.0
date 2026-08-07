// js/services/chamadosService.js
// Serviço de operações com chamados no Firebase
// NUNCA expõe credenciais - usa a config centralizada

import { db } from '../firebase/config.js';
import { ref, get, set, update, push, remove } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

export const chamadosService = {
    
    /**
     * Busca listas de equipamentos e cenários
     */
    async buscarListas() {
        try {
            const snap = await get(ref(db, 'app/listas'));
            
            if (snap.exists()) {
                return snap.val();
            }
            
            return { equipamentos: [], cenarios: [] };
        } catch (error) {
            console.error('Erro ao buscar listas:', error);
            throw error;
        }
    },

    /**
     * Lista todos os chamados (sem os deletados)
     */
    async listarChamados() {
        try {
            const snap = await get(ref(db, 'app/chamados'));
            
            if (!snap.exists()) {
                return [];
            }

            const chamados = [];
            snap.forEach((child) => {
                const chamado = child.val();
                // Ignorar chamados marcados como deletados
                if (chamado.deleted !== true) {
                    chamados.push({
                        id: child.key,
                        ...chamado
                    });
                }
            });

            // Ordenar por data (mais recente primeiro)
            return chamados.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } catch (error) {
            console.error('Erro ao listar chamados:', error);
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
                // Filtro por data inicial
                if (filtros.dataIni) {
                    const ini = new Date(filtros.dataIni + "T00:00:00").getTime();
                    if ((chamado.createdAt || 0) < ini) return false;
                }

                // Filtro por data final
                if (filtros.dataFim) {
                    const fim = new Date(filtros.dataFim + "T23:59:59").getTime();
                    if ((chamado.createdAt || 0) > fim) return false;
                }

                // Filtro por analista
                if (filtros.analista) {
                    const termo = filtros.analista.toLowerCase();
                    if (!(chamado.analista || '').toLowerCase().includes(termo)) return false;
                }

                // Filtro por chamado
                if (filtros.chamado) {
                    const termo = filtros.chamado.toLowerCase();
                    if (!(chamado.chamado || '').toLowerCase().includes(termo)) return false;
                }

                // Filtro por linha
                if (filtros.linha) {
                    const linhaLimpa = (chamado.linha || '').replace(/\D/g, '');
                    const filtroLimpo = filtros.linha.replace(/\D/g, '');
                    if (!linhaLimpa.includes(filtroLimpo)) return false;
                }

                // Filtro por equipamento
                if (filtros.equipamento) {
                    if (chamado.equipamento !== filtros.equipamento) return false;
                }

                // Filtro por cenário
                if (filtros.cenario) {
                    if (chamado.cenario !== filtros.cenario) return false;
                }

                return true;
            });
        } catch (error) {
            console.error('Erro ao buscar com filtros:', error);
            throw error;
        }
    },

    /**
     * Buscar um chamado específico
     */
    async buscarChamado(id) {
        try {
            const snap = await get(ref(db, `app/chamados/${id}`));
            
            if (!snap.exists()) {
                throw new Error('Chamado não encontrado');
            }

            return {
                id: snap.key,
                ...snap.val()
            };
        } catch (error) {
            console.error('Erro ao buscar chamado:', error);
            throw error;
        }
    },

    /**
     * Criar novo chamado
     */
    async criarChamado(dados) {
        try {
            const novoRef = push(ref(db, 'app/chamados'));
            
            const chamado = {
                analista: dados.analista || '',
                chamado: dados.chamado || '',
                linha: dados.linha || '',
                equipamento: dados.equipamento || '',
                cenario: dados.cenario || '',
                observacoes: dados.observacoes || '',
                createdAt: dados.createdAt || Date.now(),
                createdBy: dados.createdBy || 'web',
                updatedAt: Date.now()
            };

            await set(novoRef, chamado);
            
            return { id: novoRef.key, ...chamado };
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
            const atualizacao = {
                analista: dados.analista,
                chamado: dados.chamado,
                linha: dados.linha,
                equipamento: dados.equipamento,
                cenario: dados.cenario,
                observacoes: dados.observacoes,
                updatedAt: Date.now()
            };

            await update(ref(db, `app/chamados/${id}`), atualizacao);
            
            return { id, ...atualizacao };
        } catch (error) {
            console.error('Erro ao atualizar chamado:', error);
            throw error;
        }
    },

    /**
     * Excluir chamado (soft delete)
     */
    async excluirChamado(id) {
        try {
            await update(ref(db, `app/chamados/${id}`), {
                deleted: true,
                deletedAt: Date.now()
            });
            
            return true;
        } catch (error) {
            console.error('Erro ao excluir chamado:', error);
            throw error;
        }
    }
};
