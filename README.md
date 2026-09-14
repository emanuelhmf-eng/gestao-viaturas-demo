<p align="center">
  <img src="./assets/demo-logo.svg" alt="Frota Demo" width="110" />
</p>

<h1 align="center">🚗 Sistema Web de Gestão de Viaturas — Demo</h1>

<p align="center">
  Aplicação web demonstrativa para gestão de veículos, operações, checklists, manutenção e histórico.
</p>

> **Versão pública de portfólio.** Todos os nomes, veículos, identificadores, locais e registros são fictícios. Esta demonstração não se conecta a Firebase, contas reais ou banco de produção.

## 🎯 Sobre o projeto

O projeto nasceu da identificação de uma necessidade real de centralizar informações relacionadas à disponibilidade, utilização e acompanhamento de veículos.

A versão disponibilizada neste repositório foi adaptada exclusivamente para demonstração e estudo. Ela mantém os principais fluxos de negócio do projeto, mas utiliza identidade visual genérica, dados fictícios, autenticação demonstrativa e armazenamento local no navegador.

## 💡 Problema identificado

A gestão das informações envolve diferentes dados e processos que precisam permanecer relacionados. Entre os principais desafios estavam:

- visualizar rapidamente a disponibilidade dos veículos;
- registrar utilização e alterações de status;
- organizar operações e equipes vinculadas;
- acompanhar quilometragem e manutenção;
- registrar checklists e avarias;
- manter histórico das movimentações;
- centralizar cadastros utilizados pelos demais módulos.

## 💻 Solução proposta

A aplicação reúne os principais fluxos em uma única interface, com dados de demonstração que podem ser alterados livremente e restaurados a qualquer momento.

### Funcionalidades

- Dashboard com indicadores da frota;
- gestão de veículos;
- estados de disponibilidade;
- cadastro e edição de integrantes fictícios;
- operações em andamento;
- checklists;
- manutenção;
- fichas de avaria;
- histórico;
- geração de PDFs demonstrativos;
- sessão de visitante sem credenciais externas;
- restauração dos dados originais da demonstração.

## 🛠️ Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript (ES Modules)
- Node.js 20+ para servidor local e testes
- `localStorage` para persistência da demonstração
- Node Test Runner para testes automatizados
- Bibliotecas externas carregadas por CDN para recursos de interface e PDF

> O projeto original utilizou Firebase. Nesta versão pública, `firebase.js` funciona apenas como camada de compatibilidade para os módulos existentes e exporta serviços locais da demonstração.

## 🧱 Arquitetura da versão demo

```text
gestao-viaturas-demo/
├── assets/                 # Identidade visual e imagens demonstrativas
├── demo/
│   ├── auth.mjs            # Sessão demonstrativa
│   ├── seed.mjs            # Dados fictícios iniciais
│   ├── serve.mjs           # Servidor HTTP local
│   ├── store.mjs           # Persistência local e API compatível
│   └── ui.mjs              # Recursos específicos da demonstração
├── modules/                # Módulos funcionais da aplicação
├── tests/                  # Testes automatizados
├── firebase.js             # Compatibilidade: sem conexão externa
├── index.html
├── script.js
├── style.css
└── package.json
```

## ▶️ Executar localmente

### Requisito

- Node.js 20 ou superior

Não é necessário instalar dependências.

```bash
npm start
```

Depois acesse:

```text
http://127.0.0.1:4173
```

Clique em **Explorar demonstração**. Não há senha.

> Abra o projeto por um servidor HTTP. Abertura direta do `index.html` pelo explorador de arquivos pode impedir o carregamento correto dos módulos JavaScript.

## 🧪 Testes automatizados

Execute:

```bash
npm test
```

A suíte cobre pontos como:

- normalização e contagem dos status da frota;
- consistência dos dados fictícios;
- cadastro, edição, consulta e exclusão;
- persistência local;
- listeners usados para atualizar a interface;
- restauração dos dados da demonstração;
- sessão de visitante;
- isolamento de Firebase e configurações de produção.

## 💾 Persistência da demonstração

As alterações são armazenadas no `localStorage` do navegador e ficam restritas à origem utilizada para abrir o projeto.

O botão **Restaurar dados** apaga as alterações locais e recria os exemplos fictícios.

Esta versão não oferece sincronização entre dispositivos, autenticação real nem garantias de um ambiente de produção.

## 🧠 Desenvolvimento assistido por IA

A implementação e evolução do projeto contaram com forte apoio de ferramentas de Inteligência Artificial no Visual Studio Code.

Minha participação envolveu:

- identificação do problema;
- levantamento de requisitos;
- definição de funcionalidades e regras de negócio;
- estruturação dos fluxos;
- testes e validação;
- identificação e investigação de erros;
- refinamento da interface;
- evolução iterativa da solução.

Como estudante de Análise e Desenvolvimento de Sistemas, utilizo o projeto também como ambiente de aprendizado para aprofundar programação, JavaScript, persistência de dados, arquitetura de aplicações e manutenção de código.

## 📚 Principais aprendizados

O projeto proporcionou contato prático com:

- organização de uma aplicação web modular;
- funções, objetos, eventos e manipulação do DOM;
- operações CRUD;
- persistência de dados;
- atualização de estado da interface;
- regras de negócio envolvendo disponibilidade de veículos;
- testes automatizados;
- depuração e tratamento de erros;
- documentação e preparação de uma versão pública sanitizada.

## 🔐 Segurança e privacidade

A versão pública foi separada do ambiente original e preparada para portfólio.

Ela não contém:

- credenciais de produção;
- service accounts;
- chaves privadas;
- contas reais;
- conexão com banco de produção;
- dados pessoais reais;
- identificadores institucionais reais.

---

### 👨‍💻 Autor

**Emanuel Henrique**  
Estudante de Análise e Desenvolvimento de Sistemas — FPB  
Buscando oportunidade de estágio em Desenvolvimento de Software.

## 🌐 Demonstração online

A versão demonstrativa do sistema está disponível para teste diretamente
pelo navegador:

👉 **[Acessar demonstração do sistema](https://emanuelhmf-eng.github.io/gestao-viaturas-demo/)**

> A demonstração utiliza exclusivamente dados fictícios e não possui
> conexão com sistemas ou bancos de dados institucionais.
