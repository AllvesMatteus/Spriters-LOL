# 🚀 Spriters-LOL

O **Spriters-LOL** é uma ferramenta avançada de análise de desempenho e histórico de partidas para League of Legends, focada em ajudar jogadores a entenderem seus pontos fracos e subirem de elo com dados reais.

![Banner](https://github.com/AllvesMatteus/Spriters-LOL/raw/main/src/assets/banner_placeholder.png)

## ✨ Diferencial
Ao contrário de scouts genéricos, o Spriters-LOL analisa seu comportamento em cada rota específica e compara com a média oficial do elo que você deseja alcançar. Ele oferece dicas personalizadas sobre:
- **Farm (CS/min)** ajustado por lane.
- **Placar de Visão** e controle de mapa.
- **KDA e Participação em Abates**.
- **Dano por Minuto** relativo à sua função no time.

## 🛠️ Tecnologias
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express (Proxy para Riot API)
- **API:** Riot Games API

## 🚀 Como rodar o projeto
1. Clone o repositório:
   ```bash
   git clone https://github.com/AllvesMatteus/Spriters-LOL.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure sua chave da Riot API:
   - Crie um arquivo `.env` na raiz.
   - Adicione sua chave: `VITE_RIOT_API_KEY=SUA_CHAVE_AQUI`
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 📄 Licença
Este projeto é para fins de estudo e portfólio. Todos os dados são fornecidos pela Riot Games API.
