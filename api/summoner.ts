const RIOT_API_KEY = process.env.RIOT_API_KEY;

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

export default async function handler(req: any, res: any) {
  const { gameName, tagLine, region } = req.query;

  if (!RIOT_API_KEY) {
    console.error("CRITICAL ERROR: RIOT_API_KEY is not defined in Vercel Environment Variables!");
    return res.status(500).json({ error: "API Key missing in server environment" });
  }

  if (!gameName || !tagLine || !region) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const routing = REGION_ROUTING[region as string] || "americas";

  try {
    const accountUrl = `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${RIOT_API_KEY}`;
    const accountRes = await fetch(accountUrl);
    if (!accountRes.ok) {
      throw new Error(`Account not found (${accountRes.status})`);
    }
    const accountData = await accountRes.json();

    const summonerUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}?api_key=${RIOT_API_KEY}`;
    const summonerRes = await fetch(summonerUrl);
    if (!summonerRes.ok) throw new Error("Summoner not found");
    const summonerData = await summonerRes.json();

    const leagueUrl = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${accountData.puuid}?api_key=${RIOT_API_KEY}`;
    const leagueRes = await fetch(leagueUrl);
    const leagueData = await leagueRes.json();

    return res.status(200).json({
      account: accountData,
      summoner: summonerData,
      league: leagueData,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
