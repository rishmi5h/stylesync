import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;
const MODEL = 'llama-3.3-70b-versatile';

function extractJSON(text) {
  text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  const arrayStart = text.indexOf('[');
  const objectStart = text.indexOf('{');

  let startIndex = -1;
  if (arrayStart === -1 && objectStart === -1) {
    throw new Error('No JSON found in response');
  } else if (arrayStart === -1) {
    startIndex = objectStart;
  } else if (objectStart === -1) {
    startIndex = arrayStart;
  } else {
    startIndex = Math.min(arrayStart, objectStart);
  }

  const jsonStr = text.slice(startIndex);

  const opener = jsonStr[0];
  const closer = opener === '[' ? ']' : '}';
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const ch = jsonStr[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === opener || ch === (opener === '[' ? '{' : '[')) depth++;
    if (ch === closer || ch === (closer === ']' ? '}' : ']')) depth--;
    if (depth === 0) {
      return JSON.parse(jsonStr.slice(0, i + 1));
    }
  }

  return JSON.parse(jsonStr);
}

async function callGroq(systemPrompt, userMessage, retries = 1) {
  if (!groq) {
    throw new Error('Groq API key is not configured. Add GROQ_API_KEY to your .env file.');
  }
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.8,
        max_tokens: 4096,
      });

      const text = completion.choices[0]?.message?.content || '';
      return extractJSON(text);
    } catch (error) {
      if (attempt < retries) {
        console.warn(`Groq API call failed (attempt ${attempt + 1}), retrying...`, error.message);
        continue;
      }
      throw error;
    }
  }
}

function buildWardrobeSummary(wardrobe) {
  return wardrobe.map((item) => ({
    id: item.id,
    category: item.category,
    subcategory: item.subcategory,
    color: item.color,
    pattern: item.pattern,
    fabric_guess: item.fabric_guess,
    formality: item.formality,
    season: item.season,
    weather_suitability: item.weather_suitability,
    occasion_tags: item.occasion_tags,
    description: item.description,
  }));
}

export { extractJSON, buildWardrobeSummary };

export async function generateOutfitIdeas(wardrobe, profile, filters = {}) {
  const occasion = filters.occasion || 'any';
  const season = filters.season || 'all_season';
  const mood = filters.mood || 'versatile';

  const systemPrompt = `You are an expert Indian fashion stylist. Given a user's wardrobe, generate as many UNIQUE outfit combinations as possible using their existing clothes.

CONTEXT: User is based in India. Consider Indian weather, Indian office culture, and both Western + ethnic Indian clothing.

RULES:
- Each outfit must use ONLY items from the provided wardrobe (reference by exact item ID)
- Every outfit must have at minimum: a top/ethnic_top + bottom/ethnic_bottom + footwear (OR an ethnic_set + footwear)
- Optionally add: outerwear, accessories
- NO duplicate outfits — each combination must be unique
- Apply color theory: complementary, analogous, or monochromatic pairings work best
- Mix Western and ethnic pieces where it makes sense (e.g., kurta + jeans + sneakers = indo-western)
- Consider fabric and season compatibility (don't pair a wool jacket with cotton shorts)
- Generate outfit ideas for the requested occasion/mood filter
- Even with few items (3-5), be creative — the same shirt can appear in multiple outfits with different bottoms/shoes
- Generate between 4 to 15 outfits depending on wardrobe size

OCCASION FILTER: "${occasion}"
SEASON FILTER: "${season}"
MOOD/VIBE: "${mood}"

For each outfit, categorize it into one of these vibes:
- casual_chill: Relaxed everyday wear
- office_ready: Professional but stylish
- date_worthy: Impressive and put-together
- street_cool: Trendy streetwear vibes
- ethnic_elegant: Traditional/ethnic looks
- indo_western: Fusion of Indian and Western
- weekend_brunch: Smart casual weekend look
- party_mode: Night out / party ready
- travel_comfy: Comfortable yet stylish for travel
- festive_glam: Festival / wedding guest looks

Return a JSON array of outfit objects:
[
  {
    "outfit_name": "The Monday Minimalist",
    "vibe": "office_ready",
    "occasion": "office",
    "items": {
      "top": { "item_id": "xxx", "name": "white oxford shirt" },
      "bottom": { "item_id": "xxx", "name": "navy chinos" },
      "footwear": { "item_id": "xxx", "name": "brown loafers" },
      "outerwear": null,
      "accessories": []
    },
    "color_palette": ["white", "navy", "brown"],
    "style_tip": "Tuck in the shirt and roll up sleeves for a relaxed office vibe. Add a watch to elevate.",
    "best_for": "Office meetings, client calls",
    "weather_note": "Great for AC offices, pair with light jacket if stepping out in Delhi winter"
  }
]

IMPORTANT:
- Give each outfit a creative, fun name that Indians would relate to
- Style tips should be practical and specific, not generic
- Weather notes should reference Indian cities/climate
- best_for should mention real Indian scenarios (office in Gurgaon, college in Mumbai, date at Hauz Khas, etc.)
- Return ONLY valid JSON array, no markdown`;

  const wardrobeSummary = buildWardrobeSummary(wardrobe);

  const userMessage = JSON.stringify({
    wardrobe: wardrobeSummary,
    profile,
    filters: { occasion, season, mood },
  });

  return await callGroq(systemPrompt, userMessage);
}

export async function generateRecommendations(wardrobe, profile) {
  const systemPrompt = `You are a fashion consultant specializing in the Indian market, analyzing a wardrobe for gaps.

Given this wardrobe inventory and the user's style preferences, identify:
1. What categories/colors/styles are over-represented
2. What's missing that would unlock the most new outfit combinations
3. Suggest exactly 2 items to buy, with:
   - item_type and description
   - why it fills a gap
   - which existing items (by ID) it would pair well with (at least 3 pairings)
   - estimated price range for Indian market (budget + premium option)
   - search_query: a search string the user can use on Myntra/Amazon India

Consider Indian fashion context:
- Suggest ethnic pieces if wardrobe is all Western (and vice versa)
- Consider Indian weather (hot summers, monsoon, mild winters)
- Price in INR (₹)
- Reference Indian brands and shopping platforms

Return as JSON:
{
  "wardrobe_analysis": {
    "strengths": "...",
    "gaps": "..."
  },
  "recommendations": [
    {
      "item_type": "olive chinos",
      "description": "...",
      "why": "...",
      "pairs_with": ["item_id_1", "item_id_2", "item_id_3"],
      "budget_price": "₹800-1200",
      "premium_price": "₹2500-4000",
      "search_query": "olive green chinos men slim fit"
    }
  ]
}
Return ONLY valid JSON, no markdown.`;

  const wardrobeSummary = buildWardrobeSummary(wardrobe);
  const userMessage = JSON.stringify({ wardrobe: wardrobeSummary, profile });
  return await callGroq(systemPrompt, userMessage);
}
