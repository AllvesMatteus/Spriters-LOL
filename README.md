# 🎮 Spriters LOL

> Ferramenta avançada de análise de desempenho para **League of Legends** — histórico de partidas, estatísticas inteligentes e dicas personalizadas para subir de elo.

---

## ✨ Funcionalidades

### 📊 Análise de Desempenho
- **Win Rate dinâmico** — exibe a taxa de vitória de acordo com o filtro ativo (Total, Ranqueada Solo, Ranqueada Flex, ARAM)
- **Radar de stats** — compara suas métricas com a média do elo desejado
- **Dicas personalizadas** — sugestões de melhoria por lane (Top, Jungle, Mid, ADC, Suporte)

### 🃏 Histórico de Partidas
- Cards redesenhados com barra de cor por resultado (vitória/derrota/MVP/ACE)
- KDA destacado, itens, feitiços, runas e CS por minuto
- Badges: **MVP**, **ACE**, **Multi-kills** (Double, Triple, Quadra, Penta)
- **Tooltip de jogadores** — ao passar o mouse sobre qualquer invocador aparece:
  - Elo atual (Solo/Duo com emblema visual)
  - Win Rate, KDA e Lane principal
  - Barra W/L visual

### 🔍 Filtros de Partidas
- Filtragem por **Total**, **Ranqueada Solo**, **Ranqueada Flex** e **ARAM**
- Indicador de aba ativa com traço verde animado

### 👥 Recentemente Jogado Com
- Lista de invocadores jogados juntos ou contra nas últimas 20 partidas
- Tooltip ao hover com elo, win rate, KDA e lane principal

### 📄 Páginas Extras
- **Política de Privacidade** — informações sobre coleta de dados e uso da Riot API
- **Contato** — links para o GitHub do desenvolvedor

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express (proxy da Riot API) |
| Build | Vite |
| API | [Riot Games API v5](https://developer.riotgames.com/) |

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- Chave de desenvolvimento da [Riot Games API](https://developer.riotgames.com/)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/AllvesMatteus/Spriters-LOL.git
cd Spriters-LOL

# Instale as dependências
npm install
```

### Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
RIOT_API_KEY=RGAPI-sua-chave-aqui
```

### Executar

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura do Projeto

```
src/
├── assets/
│   └── images/
│       ├── lanes/          # Ícones de rota (Top, Jungle, Mid, ADC, Suporte)
│       ├── logo/           # Logo do sistema
│       └── routes/         # Imagens de seleção de rota
├── components/
│   ├── MatchHistory.tsx    # Cards de partida + tooltip de jogadores
│   ├── StatsSummary.tsx    # Radar de stats + Win Rate dinâmico
│   ├── SidebarTabs.tsx     # Campeões mais jogados + recentemente jogado com
│   ├── ProfileCard.tsx     # Card de perfil do invocador
│   ├── RankCard.tsx        # Card de ranque
│   ├── ImprovementTips.tsx # Dicas de melhoria por lane
│   ├── HomePage.tsx        # Página inicial com busca
│   ├── Header.tsx          # Cabeçalho com busca rápida
│   ├── Footer.tsx          # Rodapé com navegação
│   ├── PrivacyPolicy.tsx   # Política de Privacidade
│   └── ContactPage.tsx     # Página de Contato
├── utils/
│   └── helpers.ts          # Funções de cálculo de stats, KDA, elo etc.
├── types.ts                # Interfaces TypeScript
└── App.tsx                 # Roteamento e estado global
server.ts                   # Servidor Express (proxy da Riot API)
```

---

## 📄 Licença

Este projeto é para fins de **estudo e portfólio**.  
Todos os dados de jogadores são fornecidos pela **Riot Games API** e pertencem à Riot Games.

> Spriters LOL não é endossado pela Riot Games e não reflete as visões ou opiniões da Riot Games ou de qualquer pessoa oficialmente envolvida na produção ou gerenciamento de League of Legends.
