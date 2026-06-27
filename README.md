SPS_v2/
│
├── index.html
├── login.html
├── dashboard.html
├── chamados.html
├── encaminhamentos.html
├── usuarios.html
├── relatorios.html
├── configuracoes.html
│
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── layout.css
│   ├── components.css
│   ├── forms.css
│   ├── tables.css
│   └── pages/
│
├── js/
│   ├── app.js
│   ├── firebase/
│   │   ├── config.js
│   │   ├── auth.js
│   │   ├── database.js
│   │   └── rules.js
│   ├── services/
│   ├── pages/
│   ├── components/
│   └── utils/
│
├── assets/
│   ├── icons/
│   ├── images/
│   └── logo/
│
├── docs/
│
└── README.md
**Não criaremos um sistema.**
Primeiro criaremos a **engenharia do sistema**.

O Documento Mestre (DMP) será a "Constituição" do SPS v2. Todo o código deverá seguir esse documento.

Minha proposta é dividi-lo em aproximadamente **18 capítulos**, cada um revisado e aprovado antes de seguir para o próximo.

Assim evitamos retrabalho.

---

# DOCUMENTO MESTRE DO PROJETO (DMP)

**Projeto:** SPS v2 – Sistema de Controle de Chamados e Encaminhamentos

**Versão:** 2.0

**Status:** Em Desenvolvimento

**Tecnologia**

* HTML5
* CSS3
* JavaScript ES6 Modules
* Firebase Authentication
* Firebase Realtime Database
* GitHub Pages
* GitHub
* Visual Studio Code

---

# Índice

## CAPÍTULO 1

Visão Geral

---

## CAPÍTULO 2

Objetivos

---

## CAPÍTULO 3

Arquitetura

---

## CAPÍTULO 4

Estrutura do Projeto

---

## CAPÍTULO 5

Banco de Dados

---

## CAPÍTULO 6

Autenticação

---

## CAPÍTULO 7

Permissões

---

## CAPÍTULO 8

Layout

---

## CAPÍTULO 9

Módulos

---

## CAPÍTULO 10

Segurança

---

## CAPÍTULO 11

Padrões de Código

---

## CAPÍTULO 12

Fluxos

---

## CAPÍTULO 13

UML

---

## CAPÍTULO 14

Plano de Desenvolvimento

---

## CAPÍTULO 15

Plano de Testes

---

## CAPÍTULO 16

Implantação

---

## CAPÍTULO 17

Roadmap

---

## CAPÍTULO 18

Checklist

---

# CAPÍTULO 1

# VISÃO GERAL

## Nome

SPS v2

Sistema de Controle de Chamados e Encaminhamentos

---

## Objetivo

O SPS v2 será uma aplicação web destinada ao gerenciamento operacional de chamados e encaminhamentos técnicos entre equipes.

O sistema permitirá:

* registrar chamados;
* acompanhar análises;
* controlar e-mails encaminhados;
* acompanhar SLA;
* gerar relatórios;
* controlar usuários;
* registrar auditoria;
* manter histórico completo das alterações.

Todo o sistema será executado utilizando apenas serviços gratuitos.

---

## Princípios

O SPS v2 deverá ser:

* simples;
* rápido;
* seguro;
* modular;
* expansível;
* fácil de manter;
* preparado para crescimento.

---

## Público

Analistas

Supervisores

Administradores

---

## Navegadores

Google Chrome

Microsoft Edge

Firefox

---

## Resolução mínima

1366 x 768

Ideal

1920 x 1080

---

## Tecnologia

Frontend

HTML5

CSS3

JavaScript

---

Hospedagem

GitHub Pages

---

Banco

Firebase Realtime Database

---

Autenticação

Firebase Authentication

---

Versionamento

GitHub

---

Editor

Visual Studio Code

---

# Objetivos Técnicos

Nunca armazenar senhas.

Nunca validar login manualmente.

Nunca utilizar localStorage para informações sensíveis.

Sempre utilizar HTTPS.

Sempre utilizar Firebase Authentication.

Sempre validar permissões.

Sempre utilizar módulos JavaScript.

---

# Objetivos Operacionais

Registrar chamados.

Registrar encaminhamentos.

Registrar histórico.

Gerar indicadores.

Gerar Excel.

Controlar usuários.

Controlar permissões.

Registrar logs.

Registrar auditoria.

---

# Objetivos de Performance

Abrir Dashboard

< 2 segundos

Cadastrar chamado

< 1 segundo

Cadastrar encaminhamento

< 1 segundo

Pesquisar

< 1 segundo

Exportar Excel

< 5 segundos

---

# Objetivos de Segurança

Proteção de rotas.

Sessão autenticada.

Controle por UID.

Perfis.

Regras do Firebase.

Logs.

Auditoria.

---

# Filosofia do Projeto

O SPS v2 NÃO será desenvolvido adicionando funcionalidades de maneira improvisada.

Cada tela será construída obedecendo:

Arquitetura

↓

Banco

↓

Regras

↓

Interface

↓

Testes

↓

Documentação

Somente após a aprovação de uma etapa será iniciada a próxima.

---

# Situação Atual

Projeto iniciado.

Firebase criado.

Projeto GitHub será criado.

Escopo definido.

Módulo Encaminhamento aprovado.

Arquitetura em elaboração.

---

# Critérios de Qualidade

Todo código deverá:

✔ possuir responsabilidade única;

✔ evitar duplicação;

✔ utilizar async/await;

✔ possuir tratamento de erro;

✔ ser modular;

✔ possuir nomenclatura padronizada;

✔ ser documentado quando necessário;

✔ ser facilmente testável;

✔ possuir baixo acoplamento;

✔ permitir manutenção futura.

---

# Critérios de Sucesso

O projeto será considerado concluído quando:

✔ autenticação estiver totalmente segura;

✔ todas as permissões forem controladas por perfil;

✔ todo histórico estiver preservado;

✔ relatórios estiverem funcionando;

✔ exportação Excel estiver funcionando;

✔ dashboard estiver operacional;

✔ auditoria completa estiver implementada;

✔ documentação atualizada;

✔ deploy funcionando via GitHub Pages;

✔ nenhuma funcionalidade depender de serviços pagos.

---

# Revisões do Documento

| Versão | Data         | Responsável    | Descrição                                  |
| ------ | ------------ | -------------- | ------------------------------------------ |
| 0.1    | 27/06/2026   | Projeto SPS v2 | Criação do Documento Mestre                |
| 0.2    | Em andamento | Projeto SPS v2 | Capítulos sendo aprovados incrementalmente |

---

## Encerramento do Capítulo 1

**Status:** ✅ Aprovado para revisão.

Este capítulo define a identidade e os princípios do SPS v2.

---

### Próximo capítulo

O **Capítulo 2 – Objetivos e Escopo Funcional** detalhará todas as funcionalidades do sistema, organizadas por módulos (Dashboard, Usuários, Chamados, Encaminhamentos, Relatórios, Logs, Configurações etc.), servindo como contrato funcional antes de iniciarmos a arquitetura técnica detalhada. Esse será o documento que orientará todo o desenvolvimento das próximas fases.
# DOCUMENTO MESTRE DO PROJETO (DMP)

# CAPÍTULO 2 – OBJETIVOS E ESCOPO FUNCIONAL

Projeto: SPS v2 – Sistema de Controle de Chamados e Encaminhamentos

Versão: 2.0

Status: Em elaboração

Data: 27/06/2026

---

# 1. OBJETIVO GERAL

O SPS v2 tem como finalidade centralizar, organizar e controlar todas as atividades relacionadas ao registro, acompanhamento e encerramento de chamados e encaminhamentos técnicos realizados pela equipe operacional.

O sistema deverá substituir controles manuais e planilhas dispersas por uma aplicação web única, segura, responsiva e preparada para crescimento futuro.

Todo o projeto deverá funcionar exclusivamente utilizando tecnologias gratuitas.

---

# 2. OBJETIVOS ESPECÍFICOS

O sistema deverá permitir:

• Autenticação segura dos usuários.

• Controle de acesso por perfil.

• Cadastro de usuários.

• Cadastro de analistas.

• Cadastro de equipes.

• Cadastro de cenários.

• Cadastro de equipamentos.

• Cadastro de prioridades.

• Registro de chamados.

• Registro de encaminhamentos.

• Histórico completo de alterações.

• Auditoria das operações.

• Dashboard operacional.

• Relatórios.

• Exportação para Excel.

• Pesquisa rápida.

• Filtros avançados.

• Interface semelhante ao Microsoft Excel para aumentar produtividade.

---

# 3. ESCOPO FUNCIONAL

O SPS v2 será dividido em módulos independentes.

Cada módulo possuirá responsabilidades próprias.

Nenhum módulo deverá executar funções pertencentes a outro módulo.

---

# MÓDULO 01

LOGIN

Responsabilidade

• Autenticar usuários.

• Encerrar sessões.

• Validar permissões.

• Redirecionar para Dashboard.

Funcionalidades

✔ Login utilizando Firebase Authentication.

✔ Recuperação de senha.

✔ Logout.

✔ Sessão persistente.

✔ Proteção de rotas.

✔ Bloqueio de acesso sem autenticação.

---

# MÓDULO 02

DASHBOARD

Responsabilidade

Apresentar visão geral do ambiente.

Indicadores

• Chamados em aberto.

• Chamados encerrados.

• Encaminhamentos ativos.

• Pendências.

• SLA vencido.

• Últimos registros.

• Ranking por analista.

• Ranking por equipe.

• Gráficos.

---

# MÓDULO 03

USUÁRIOS

Responsabilidade

Controlar usuários do sistema.

Cadastro

Nome

Email

Perfil

Status

Data de criação

Último acesso

Permissões

Administrador

Supervisor

Operador

Consulta (opcional para futuras versões)

---

# MÓDULO 04

CADASTROS AUXILIARES

Responsabilidade

Manter listas utilizadas pelo sistema.

Cadastros

Analistas

Equipes

Equipamentos

Cenários

Prioridades

Status

Todos deverão possuir:

ID

Nome

Ativo

Data de criação

Usuário criador

---

# MÓDULO 05

CHAMADOS

Responsabilidade

Registrar chamados recebidos.

Campos

Número

Linha

Título

Descrição

Analista

Equipamento

Cenário

Prioridade

Status

Data

Observações

Histórico

Alterações

Exclusão lógica

---

# MÓDULO 06

ENCAMINHAMENTOS

Responsabilidade

Controlar todos os e-mails enviados para outras equipes.

Cadastro

Chamado

Título

Linha

Analista

Equipe destino

Email destino

Prioridade

Status

Observação

Data envio

Última atualização

Dias em aberto

Status

Em Aberto

Em Análise

Aguardando Retorno

Respondido

Encerrado

Cancelado

---

Layout

Tela dividida em três áreas horizontais.

Área 1

Cadastro.

Área 2

Tabela estilo Microsoft Excel.

Área 3

Rodapé com totais.

---

Tabela

Colunas

Status

Chamado

Título

Analista

Equipe

Data envio

Última atualização

Dias

Prioridade

Linha

Ações

---

Colunas fixas

Lado esquerdo

Status

Chamado

Título

Lado direito

Editar

Excluir

Histórico

As colunas intermediárias poderão possuir rolagem horizontal.

---

Ações

Editar

Histórico

Excluir (somente Administrador)

---

Histórico

Linha do tempo.

Registro automático.

Data

Hora

Usuário

Ação

Status anterior

Novo status

Observação

---

Filtros

Período

Status

Analista

Equipe

Prioridade

Chamado

Linha

Título

Texto livre

---

Exportação

Excel

Respeitando filtros aplicados.

---

Exibição inicial

Mostrar apenas

Em Aberto

Em Análise

Aguardando Retorno

Respondido

Encerrados e Cancelados somente através de filtros.

---

# MÓDULO 07

RELATÓRIOS

Objetivo

Gerar informações gerenciais.

Relatórios

Por período

Por analista

Por equipe

Por cenário

Por equipamento

Por prioridade

Por status

Por encaminhamento

Todos exportáveis para Excel.

---

# MÓDULO 08

LOGS

Registrar automaticamente:

Login

Logout

Falhas

Erros

Cadastros

Alterações

Exclusões

Exportações

Importações

Permissões negadas

---

# MÓDULO 09

AUDITORIA

Responsabilidade

Registrar todas as alterações importantes.

Cada alteração deverá armazenar:

Antes

Depois

Usuário

Data

Hora

IP (quando disponível)

User Agent

---

# MÓDULO 10

CONFIGURAÇÕES

Responsabilidade

Centralizar configurações gerais.

Itens

Tema

Sistema

Parâmetros

SLA

Listas auxiliares

Versão

---

# MÓDULO 11

PESQUISA GLOBAL

Pesquisar simultaneamente:

Chamados

Encaminhamentos

Linhas

Analistas

Equipamentos

Cenários

Título

Texto

---

# MÓDULO 12

EXPORTAÇÃO

Exportação para:

Excel (.xlsx)

(PDF ficará previsto para versão futura.)

---

# 4. FUNCIONALIDADES FUTURAS

Modo escuro.

Favoritos.

Notificações.

Dashboard personalizável.

Anexos.

Integração com Outlook.

Integração com Microsoft Teams.

Importação de planilhas.

Indicadores SLA.

API REST.

Migração para Firestore (caso necessária).

---

# 5. FUNCIONALIDADES FORA DO ESCOPO

Aplicativo mobile.

Integração SAP.

Integração ServiceNow.

Integração Power BI em tempo real.

Inteligência Artificial para classificação automática.

Envio automático de e-mails.

Chat interno.

Essas funcionalidades poderão ser avaliadas em versões futuras.

---

# 6. PREMISSAS

O sistema deverá funcionar integralmente utilizando:

GitHub Pages

Firebase Authentication

Firebase Realtime Database

HTML5

CSS3

JavaScript ES6 Modules

Visual Studio Code

GitHub

Não serão utilizados servidores próprios.

Não serão utilizados serviços pagos.

---

# 7. RESTRIÇÕES

Não armazenar senhas no banco.

Não validar login manualmente.

Não utilizar localStorage para dados sensíveis.

Não permitir acesso direto ao Firebase sem autenticação.

Não utilizar código duplicado.

Não utilizar bibliotecas desnecessárias.

Não criar módulos monolíticos.

---

# 8. CRITÉRIOS DE ACEITAÇÃO

Cada módulo será considerado concluído somente quando:

✔ Funcionar conforme especificação.

✔ Possuir tratamento de erros.

✔ Estiver integrado ao Firebase.

✔ Respeitar permissões.

✔ Possuir documentação atualizada.

✔ Passar pelos testes funcionais.

✔ Não apresentar regressões.

✔ Estiver aprovado para produção.

---

# 9. CONSIDERAÇÕES FINAIS

O SPS v2 será desenvolvido de forma incremental, priorizando arquitetura, segurança, desempenho e facilidade de manutenção.

Nenhuma funcionalidade será implementada sem especificação prévia.

Toda alteração deverá ser documentada no Documento Mestre do Projeto.

Este capítulo define o escopo funcional completo da primeira versão do SPS v2 e servirá como referência para todas as etapas seguintes do desenvolvimento.

---

FIM DO CAPÍTULO 2
