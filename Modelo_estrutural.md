# SPS v2 - MEMORANDO DO PROJETO

## IDENTIFICAÇÃO

Projeto: SPS v2

Objetivo:
Sistema Web para controle de chamados, encaminhamentos, usuários e relatórios.

Tecnologias:

* HTML5
* CSS3
* JavaScript ES Modules
* Firebase Authentication
* Firebase Realtime Database
* GitHub Pages

Editor:

Visual Studio Code + Codex

Arquitetura:

Modular.

Sem frameworks.

Sem backend próprio.

100% gratuito.

---

# FILOSOFIA

Sempre priorizar:

1. Segurança

2. Arquitetura

3. Manutenção

4. Escalabilidade

5. Performance

Nunca criar código temporário.

Nunca gerar código que precise ser refeito depois.

Cada arquivo possui responsabilidade única.

---

# ESTRUTURA

```text
SPS_v2/

index.html
login.html
dashboard.html

css/
assets/

js/

    app.js
    bootstrap.js
    router.js

    config/
        constants.js

    firebase/
        config.js
        auth.js
        database.js

    core/
        session.js
        guards.js
        logger.js

    services/
        baseService.js
        usersService.js
        chamadosService.js
        encaminhamentosService.js
        dashboardService.js

    components/
        navbar.js
        sidebar.js
        modal.js
        toast.js
        loading.js
        table.js

    pages/
        login.js
        dashboard.js
        chamados.js
        encaminhamentos.js
        usuarios.js

    utils/
        validators.js
        formatter.js
        response.js
        dates.js
```

---

# STATUS ATUAL

Infraestrutura.

Estamos estabilizando a arquitetura.

Ainda NÃO iniciar novas funcionalidades.

Primeiro finalizar:

config.js

auth.js

database.js

session.js

guards.js

bootstrap.js

router.js

Depois disso:

Login

Dashboard

Usuários

Chamados

Encaminhamentos

Relatórios

Logs

---

# ARQUIVOS CONCLUÍDOS

Estrutura inicial

reset.css

variables.css

layout.css

components.css

forms.css

tables.css

login.html

dashboard.html

config.js

(constants.js permanece válido)

---

# ARQUIVOS EM REVISÃO

auth.js

database.js

session.js

guards.js

index.html

dashboard.js

---

# ARQUIVOS A CRIAR

bootstrap.js

router.js

response.js

validators.js

navbar.js

sidebar.js

toast.js

modal.js

loading.js

table.js

---

# PADRÕES

Sempre ES Modules.

Sempre async/await.

Nunca usar var.

Nunca acessar Firebase diretamente nas páginas.

Sempre:

Página

↓

Service

↓

Firebase

↓

SDK

Nunca:

Página

↓

Firebase

---

# FIREBASE

Sempre utilizar:

Authentication

Realtime Database

Regras reais do Firebase.

Nunca armazenar senha.

Nunca validar senha manualmente.

---

# PADRÃO DE RESPOSTA

Quando solicitado:

"Mande o código completo"

Responder somente com o arquivo completo.

Sem explicações.

Quando solicitado:

"Explique"

Explicar detalhadamente.

---

# CONTROLE DE PROGRESSO

Fase:

Fundação

Sprint:

Estabilização da Arquitetura

Último arquivo:

config.js V3

Próximo:

auth.js V3

Objetivo:

Congelar toda a infraestrutura.

Somente depois iniciar funcionalidades.

---

# REGRA PRINCIPAL

Caso haja qualquer inconsistência entre arquivos existentes e novos:

NÃO continuar gerando código.

Primeiro revisar a arquitetura.

Depois corrigir.

Somente então continuar.

Nunca construir funcionalidades sobre uma base inconsistente.
