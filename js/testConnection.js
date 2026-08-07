import { database } from './firebase/config.js';

// Função para testar conexão
export async function testarConexao() {
    try {
        console.log('🔄 Testando conexão com Firebase...');
        
        // Teste 1: Verificar se consegue ler dados
        const snapshot = await database.ref('LISTAS').once('value');
        const listas = snapshot.val();
        
        console.log('✅ Conexão estabelecida com sucesso!');
        console.log('📊 Dados recebidos:', listas);
        
        // Teste 2: Verificar estrutura
        if (listas) {
            console.log('📋 Equipamentos:', listas.equipamentos);
            console.log('🎯 Cenários:', listas.cenarios);
        } else {
            console.warn('⚠️ Nenhum dado encontrado em LISTAS. Criando estrutura inicial...');
            await criarEstruturaInicial();
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erro na conexão:', error);
        return false;
    }
}

// Criar estrutura inicial se não existir
export async function criarEstruturaInicial() {
    try {
        console.log('🔧 Criando estrutura inicial do banco...');
        
        // Criar listas padrão
        const listasPadrao = {
            cenarios: [
                "Dados",
                "Voz / Ligações",
                "Falha no equipamento",
                "Não localizado no SPSWeb",
                "HLR não informado",
                "Franquia de dados",
                "Ofertas não aparecem",
                "4G inativo",
                "Claro Sync",
                "MasterAccount",
                "Excedentes de uso",
                "Outros"
            ],
            equipamentos: [
                "RTC",
                "HLR",
                "HLREDA",
                "HHUA",
                "HSS",
                "VPNSIX",
                "SGV"
            ]
        };
        
        await database.ref('LISTAS').set(listasPadrao);
        console.log('✅ Estrutura inicial criada com sucesso!');
        
        // Criar estrutura de contador
        await database.ref('CONTADOR_LINHAS').set({ init: { count: 0, lastAt: Date.now() } });
        console.log('✅ Contador de linhas inicializado!');
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao criar estrutura:', error);
        return false;
    }
}

// Verificar autenticação
export function verificarAuth() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('👤 Usuário autenticado:', user.email);
                resolve(user);
            } else {
                console.warn('⚠️ Nenhum usuário autenticado');
                resolve(null);
            }
        });
    });
}

// Função para popular dados de teste
export async function criarDadosTeste() {
    try {
        console.log('🧪 Criando dados de teste...');
        
        const chamadosTeste = [
            {
                chamado: "C-1001",
                linha: "5511999999999",
                analista: "helio",
                equipamento: "RTC",
                cenario: "Dados",
                observacoes: "Chamado de teste 1",
                createdAt: Date.now() - 3600000,
                deleted: false,
                isDuplicate: false,
                titulo: "Problema com dados móveis"
            },
            {
                chamado: "C-1002",
                linha: "5511988888888",
                analista: "maria",
                equipamento: "HLR",
                cenario: "Voz / Ligações",
                observacoes: "Chamado de teste 2",
                createdAt: Date.now() - 7200000,
                deleted: false,
                isDuplicate: false,
                titulo: "Sem sinal de voz"
            },
            {
                chamado: "C-1003",
                linha: "5511977777777",
                analista: "joao",
                equipamento: "HHUA",
                cenario: "4G inativo",
                observacoes: "Chamado de teste 3",
                createdAt: Date.now() - 10800000,
                deleted: false,
                isDuplicate: false,
                titulo: "4G não funciona"
            }
        ];
        
        for (const chamado of chamadosTeste) {
            await database.ref('CHAMADOS').push(chamado);
        }
        
        console.log('✅ Dados de teste criados com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao criar dados de teste:', error);
        return false;
    }
}
