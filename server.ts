import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import * as cheerio from "cheerio";

dotenv.config();

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const matchCache = new Map<string, any>();

// Region mapping
const REGION_ROUTING: Record<string, string> = {
  br1: "americas",
  na1: "americas",
  la1: "americas",
  la2: "americas",
  kr: "asia",
  jp1: "asia",
  euw1: "europe",
  eun1: "europe",
  tr1: "europe",
  ru: "europe",
  oc1: "sea",
  ph2: "sea",
  sg2: "sea",
  th2: "sea",
  tw2: "sea",
  vn2: "sea",
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/summoner", async (req, res) => {
    const { gameName, tagLine, region } = req.query;

    if (!gameName || !tagLine || !region) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const routing = REGION_ROUTING[region as string] || "americas";

    try {
      // 1. Get PUUID from Riot ID
      const accountUrl = `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${RIOT_API_KEY}`;
      console.log(`[API] Fetching: ${accountUrl.replace(RIOT_API_KEY!, 'REDACTED')}`);
      const accountRes = await fetch(accountUrl);
      if (!accountRes.ok) {
        const errBody = await accountRes.text();
        console.error(`[API] Account response ${accountRes.status}:`, errBody);
        throw new Error(`Account not found (${accountRes.status})`);
      }
      const accountData = await accountRes.json();

      // 2. Get Summoner Data from PUUID
      const summonerUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}?api_key=${RIOT_API_KEY}`;
      const summonerRes = await fetch(summonerUrl);
      if (!summonerRes.ok) throw new Error("Summoner not found");
      const summonerData = await summonerRes.json();

      // 3. Get League Data (Rank)
      const leagueUrl = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${accountData.puuid}?api_key=${RIOT_API_KEY}`;
      const leagueRes = await fetch(leagueUrl);
      const leagueData = await leagueRes.json();

      res.json({
        account: accountData,
        summoner: summonerData,
        league: leagueData,
      });
    } catch (error: any) {
      console.error("Summoner Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Lightweight rank fetch by PUUID (used by tooltip hover)
  app.get("/api/rank", async (req, res) => {
    const { puuid, region } = req.query;
    if (!puuid || !region) return res.status(400).json({ error: "Missing puuid or region" });
    try {
      const url = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`;
      const r = await fetch(url);
      if (!r.ok) return res.status(r.status).json({ error: "Rank not found" });
      const data = await r.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/matches", async (req, res) => {
    const { puuid, region, count = 10, start = 0, queue } = req.query;
    const routing = REGION_ROUTING[region as string] || "americas";

    try {
      let matchIdsUrl = `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}&api_key=${RIOT_API_KEY}`;
      if (queue && queue !== "all") {
        matchIdsUrl += `&queue=${queue}`;
      }
      const matchIdsRes = await fetch(matchIdsUrl);
      const matchIds = await matchIdsRes.json();

      const matchDetails = await Promise.all(
        matchIds.map(async (id: string) => {
          if (matchCache.has(id)) return matchCache.get(id);
          try {
            const detailUrl = `https://${routing}.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RIOT_API_KEY}`;
            const detailRes = await fetch(detailUrl);

            if (detailRes.status === 429) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              const retryRes = await fetch(detailUrl);
              if (retryRes.ok) {
                const data = await retryRes.json();
                matchCache.set(id, data);
                return data;
              }
            } else if (detailRes.ok) {
              const data = await detailRes.json();
              matchCache.set(id, data);
              return data;
            }
          } catch {
            return null;
          }
          return null;
        })
      );

      const validMatches = matchDetails.filter(m => m && m.info);
      res.json(validMatches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
