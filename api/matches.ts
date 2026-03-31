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
  const { puuid, region, count = 10, start = 0, queue } = req.query;

  if (!RIOT_API_KEY) {
    console.error("CRITICAL ERROR: RIOT_API_KEY is not defined in Vercel Environment Variables!");
    return res.status(500).json({ error: "API Key missing in server environment" });
  }

  const routing = REGION_ROUTING[region as string] || "americas";

  try {
    let matchIdsUrl = `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}&api_key=${RIOT_API_KEY}`;
    if (queue && queue !== "all") {
      matchIdsUrl += `&queue=${queue}`;
    }
    const matchIdsRes = await fetch(matchIdsUrl);
    const matchIds = await matchIdsRes.json();

    const matchDetails = [];
    for (const id of matchIds) {
      if (typeof id !== "string") continue; // Prevent unexpected API responses
      
      try {
        const detailUrl = `https://${routing}.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RIOT_API_KEY}`;
        const detailRes = await fetch(detailUrl);

        if (detailRes.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const retryRes = await fetch(detailUrl);
          if (retryRes.ok) matchDetails.push(await retryRes.json());
        } else if (detailRes.ok) {
          matchDetails.push(await detailRes.json());
        }

        await new Promise(resolve => setTimeout(resolve, 50));
      } catch {
        continue;
      }
    }

    const validMatches = matchDetails.filter(m => m && m.info);
    return res.status(200).json(validMatches);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
