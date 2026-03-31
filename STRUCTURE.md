# Spriters-LOL — Estrutura do Projeto

```
src/
├── assets/                  → Imagens, fontes e arquivos estáticos
│   ├── images/
│   │   ├── logo/
│   │   │   └── logo.png     → Logo principal do Spriters LOL
│   │   └── lanes/           → Ícones das rotas para o seletor de lane
│   │       ├── lane-top.png
│   │       ├── lane-jungle.png
│   │       ├── lane-mid.png
│   │       ├── lane-adc.png
│   │       └── lane-support.png
│   └── index.ts             → Barrel export (importe assets a partir daqui)
│
├── components/              → Componentes React reutilizáveis
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── HomePage.tsx
│   ├── ImprovementTips.tsx  → Painel "O que falta para eu subir?"
│   ├── MatchHistory.tsx     → Histórico de partidas com MVP/ACE
│   ├── ProfileCard.tsx      → Card do perfil do jogador
│   ├── RankCard.tsx         → Exibição do ranking Solo/Flex
│   ├── SidebarTabs.tsx      → Campeões mais jogados / Recentes
│   └── StatsSummary.tsx     → Radar de estatísticas
│
├── hooks/                   → Custom React Hooks (estado reutilizável)
│
├── services/                → Cópia dos helpers (era utils/helpers.ts)
│   └── helpers.ts
│
├── types/                   → Tipos e interfaces TypeScript
│   └── index.ts             → (renomear types.ts para cá futuramente)
│
├── utils/                   → Funções utilitárias puras
│   ├── helpers.ts           → KDA, Score, Queue Types, Rank Averages
│   └── index.ts             → Barrel export
│
├── App.tsx                  → Componente raiz / state global
├── index.css                → Estilos globais
├── main.tsx                 → Entry point React
└── types.ts                 → Tipos do Riot API (MatchData, SummonerData)

server.ts                    → Servidor Express + Proxy Riot API
vite.config.ts               → Configuração do Vite
.env                         → Variáveis de ambiente (RIOT_API_KEY) — NÃO subir no git
.env.example                 → Exemplo de .env para novos devs
```
