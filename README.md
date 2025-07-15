# MedSMS-Crateús AI - Painel Médico (Documentação Técnica Abrangente)

Este documento fornece uma análise técnica detalhada e um guia completo para o projeto MedSMS-Crateús AI, uma SPA (Single-Page Application) de gerenciamento clínico. O objetivo é servir como uma fonte central de informação para desenvolvedores, arquitetos de software e equipes de avaliação, facilitando a compreensão, manutenção, e a reprodução do ambiente de desenvolvimento.

---

## 1. Visão Geral e Propósito

O **MedSMS-Crateús AI** nasceu da necessidade de modernizar a gestão de clínicas e consultórios, integrando inteligência artificial para transformar dados brutos em insights acionáveis. A aplicação é um painel de controle completo que não apenas gerencia as operações do dia a dia, mas também atua como um assistente estratégico para os gestores.

O projeto foi concebido como uma **arquitetura de frontend-only**, utilizando o poder do navegador para oferecer uma experiência de usuário extremamente rápida, responsiva e com **funcionalidade offline completa**, graças à persistência de dados no **IndexedDB**.

Seu principal diferencial é uma **arquitetura de IA multi-provedor flexível**, que permite ao usuário final alternar dinamicamente entre os principais modelos de linguagem do mercado, incluindo **Google Gemini**, **Hugging Face (Gaia)**, **Groq (com Gemma2 e DeepSeek)**, e uma instância local do **LM Studio**.

---

## 2. Funcionalidades Detalhadas

A plataforma é dividida em módulos coesos que cobrem todas as facetas da gestão clínica moderna.

#### **Dashboard Inteligente com Análise SWOT por IA**
O coração da aplicação. Oferece uma visão panorâmica com estatísticas-chave, um calendário interativo e uma "Central de Operações Diárias". O diferencial é a seção de **Análise Estratégica SWOT** (Forças, Fraquezas, Oportunidades, Ameaças) que acompanha cada gráfico (financeiro, desempenho de médicos, etc.). A IA analisa os dados filtrados e gera insights valiosos, transformando gráficos em relatórios de gestão.

#### **Gestão Completa de Cadastros (CRUD)**
Módulos robustos para gerenciar todas as entidades do sistema com interfaces intuitivas em modais:
-   **Pacientes**: Cadastro detalhado com informações demográficas, de saúde, contato e endereço.
-   **Médicos, Locais e Municípios**: Gerenciamento da infraestrutura e corpo clínico.
-   **Procedimentos e Tipos**: Cadastro flexível de serviços oferecidos, com duração e vagas.
-   **Ocorrências de Agendamento**: Tipificação de eventos como "Paciente chegou", "Em atendimento", "Atraso do médico", etc.
-   **Campanhas de Saúde**: Criação de campanhas com público-alvo e período definidos.
-   **Tabelas de Preços**: Gestão de múltiplas tabelas (ex: SUS, Particular) com valores por procedimento.

#### **Arquitetura Multi-Provedor de IA**
O usuário pode, a qualquer momento, selecionar na barra lateral o provedor de IA de sua preferência:
-   **Google Gemini**: `gemini-2.5-flash`
-   **Hugging Face**: `CEIA-UFG/Gemma-3-Gaia-PT-BR-4b-it` (otimizado para português)
-   **Groq**: `gemma2-9b-it` (alta velocidade) e `deepseek-r1-distill-llama-70b`
-   **LM Studio**: Conexão com um modelo rodando localmente (configurável).

#### **Assistente Clínico Conversacional (RAG)**
Uma interface de chat onde a IA tem acesso ao contexto completo do banco de dados (pacientes, agendamentos, etc.) para responder a perguntas complexas em linguagem natural. Exemplos:
-   *"Qual o histórico de consultas do paciente Artur Silva?"*
-   *"Mostre a agenda da Dra. Evelyn Reed para amanhã."*
-   *"Qual o faturamento total com procedimentos de cardiologia este mês?"*
As respostas são exibidas em tempo real (streaming) e o histórico da conversa é salvo, permitindo que a IA mantenha o contexto entre as sessões.

#### **Central de Automação de Comunicação**
Um módulo proativo que utiliza a IA para analisar os dados e sugerir mensagens personalizadas para pacientes. As categorias de automação incluem:
-   **Lembretes de Consulta**: Para agendamentos futuros.
-   **Instruções de Preparo**: Para exames e cirurgias complexas.
-   **Acompanhamento (Follow-up)**: Mensagens pós-consulta para verificar o bem-estar do paciente.
-   **Engajamento em Campanhas**: Convites para pacientes elegíveis participarem de campanhas de saúde.

#### **Relatórios de BI Customizáveis**
Uma ferramenta de Business Intelligence que permite filtrar agendamentos por múltiplos critérios (período, médico, local, etc.), visualizar os dados em uma tabela com colunas selecionáveis e **exportar o relatório formatado para XLSX (Excel)**.

#### **Gerenciamento Robusto do Banco de Dados**
Uma seção dedicada que oferece controle total sobre os dados locais:
-   **Exportar Backup Completo**: Salva todo o banco de dados em um único arquivo `.json`.
-   **Importar Backup**: Restaura o sistema a partir de um arquivo de backup.
-   **Resetar Banco de Dados**: Apaga todos os dados e restaura o estado inicial de demonstração.

---

## 3. Tech Stack & Ferramentas

-   **Frontend**: **React 19** (com Hooks) & **TypeScript**.
-   **Inteligência Artificial**:
    -   **APIs**: Google Gemini, Hugging Face, Groq, LM Studio (OpenAI-compatible).
    -   **SDKs**: `@google/genai`, `@huggingface/inference`.
-   **Estilização**: **Tailwind CSS** (via CDN, configurado no `index.html`).
-   **Banco de Dados (Client-Side)**: **IndexedDB**.
-   **Manipulação de Planilhas**: **`xlsx`** (SheetJS) para importação/exportação.
-   **Ambiente de Desenvolvimento**: **Vite.js** (com `importmap` para carregamento de dependências sem bundling local).
-   **Gerenciador de Pacotes**: `npm`.

---

## 4. Arquitetura e Padrões de Design

### 🚨 Alerta Crítico de Segurança 🚨

A arquitetura atual é de **frontend-only**, o que significa que as chaves de API (`API_KEY`, `HF_TOKEN`, `GROQ_API_KEY`) são expostas no lado do cliente. **Isso é INSEGURO e inadequado para um ambiente de produção.** Para uma aplicação real, é **ESSENCIAL** refatorar a lógica do `aiService.ts` para um serviço de **backend** (ex: um servidor Node.js/Express ou Python/FastAPI), onde as chaves podem ser armazenadas de forma segura.

### Gerenciamento de Estado com Múltiplos Contextos

Para máxima performance e separação de responsabilidades, a aplicação utiliza três provedores de contexto:
1.  **`DataContext`**: Responsável por carregar e fornecer os dados do IndexedDB. É o "source of truth" da aplicação.
2.  **`UIContext`**: Gerencia todo o estado da interface, como a view atual, o provedor de IA selecionado, o estado de todos os modais e dados temporários de edição.
3.  **`ActionsContext`**: Centraliza toda a lógica de negócios. Contém as funções que modificam o estado (CRUD), interagem com o banco de dados e disparam notificações. Isso desacopla a lógica dos componentes visuais.

### Service Layer para IA (Padrão Fachada)

-   Toda a lógica de comunicação com as APIs de IA está encapsulada no `services/aiService.ts`.
-   Este serviço atua como uma **Fachada (Facade)**, fornecendo uma interface única e simplificada para o restante da aplicação.
-   Ele **roteia dinamicamente** as requisições para o provedor de IA correto e **normaliza as respostas** das diferentes APIs, garantindo que os componentes sempre recebam um fluxo de dados consistente.

---

## 5. Estrutura de Diretórios

A estrutura de arquivos foi organizada por funcionalidade para promover a coesão.
```
/
├── public/
├── src/ (ou raiz do projeto)
│   ├── components/       # Componentes React reutilizáveis (views, formulários, ícones)
│   │   ├── aiService.ts  # Fachada para todas as integrações de IA
│   │   └── ...
│   ├── context/          # Provedores de Contexto (DataContext, UIContext, ActionsContext)
│   ├── data/             # Dados de mock para popular o banco na primeira execução
│   ├── utils/            # Funções utilitárias (db.ts para IndexedDB, export.ts)
│   ├── App.tsx           # Componente raiz que monta os contextos e o layout
│   ├── index.tsx         # Ponto de entrada da aplicação React
│   └── types.ts          # Definições centrais de tipos TypeScript
├── .env                  # Arquivo para chaves de API locais (NÃO versionar)
├── index.html            # Ponto de entrada HTML com o importmap e config do Tailwind
├── package.json
└── vite.config.ts        # Configuração do Vite para injetar variáveis de ambiente
```

---

## 6. Executando o Projeto Localmente

Siga os passos abaixo para configurar e rodar a aplicação.

**Pré-requisitos**:
-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   `npm` (instalado com o Node.js)
-   (Opcional) [LM Studio](https://lmstudio.ai/) rodando em modo de servidor.

**Passos**:

1.  **Clone o repositório e instale as dependências**:
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DO_DIRETORIO>
    npm install
    ```

2.  **Configure as Chaves de API (2 opções)**:

    **Opção A (Recomendado): Arquivo `.env`**
    -   Crie um arquivo `.env` na raiz do projeto.
    -   Adicione as chaves dos provedores que deseja usar:
        ```env
        # Chave para a API do Google Gemini
        API_KEY="sua_chave_google_aqui"

        # Token para a API da Hugging Face
        HF_TOKEN="seu_token_huggingface_aqui"

        # Chave para a API do Groq
        GROQ_API_KEY="sua_chave_groq_aqui"

        # Configurações para o LM Studio
        LM_STUDIO_URL="http://localhost:1234/v1"
        LM_STUDIO_MODEL="seu_modelo_local_aqui"
        ```

    **Opção B: Configuração na Interface**
    -   Na barra lateral, clique no ícone de engrenagem (⚙️) ao lado do seletor "Provedor de IA".
    -   Insira suas chaves no modal. Elas serão salvas no `localStorage` e terão **precedência** sobre as do arquivo `.env`.

3.  **Execute a aplicação**:
    ```bash
    npm run dev
    ```

4.  **Acesse no Navegador**:
    -   Abra o endereço fornecido pelo Vite (geralmente `http://localhost:5173`).
    -   Na primeira execução, o IndexedDB será criado e populado com dados de demonstração.

---

## 7. Contribuições e Evolução Futura

Este projeto serve como uma base robusta e um excelente ponto de partida para um sistema de gestão clínica completo. Possíveis melhorias futuras incluem:

-   **Refatoração para Backend**: Mover a camada de serviço de IA (`aiService.ts`) e a gestão de banco de dados para um backend seguro (Node.js, Python, etc.) para proteger as chaves de API e permitir escalabilidade.
-   **Autenticação de Usuários**: Implementar um sistema de login e controle de acesso por perfis (administrador, médico, recepcionista).
-   **Prontuário Eletrônico do Paciente (PEP)**: Expandir os detalhes do paciente para um prontuário completo, com histórico de evoluções, exames e documentos.
-   **Integração com Agendamento Online**: Criar um portal para que os próprios pacientes possam agendar consultas.
