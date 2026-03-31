const RIOT_API_KEY = process.env.RIOT_API_KEY;

export default async function handler(req: any, res: any) {
  const { puuid, region } = req.query;
  
  if (!RIOT_API_KEY) {
    console.error("CRITICAL ERROR: RIOT_API_KEY is not defined in Vercel Environment Variables!");
    return res.status(500).json({ error: "API Key missing in server environment" });
  }

  if (!puuid || !region) return res.status(400).json({ error: "Missing puuid or region" });
  try {
    const url = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`;
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: "Rank not found" });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
