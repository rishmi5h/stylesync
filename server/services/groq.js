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

export async function generateTodayPick(wardrobe, profile, weather, wearHistory = [], rejectedPicks = []) {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toISOString().split('T')[0];
  const todayOccasion = profile.schedule?.[dayName.toLowerCase()] || 'casual';

  const recentItemIds = wearHistory
    .filter((entry) => {
      const diff = (today - new Date(entry.date)) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    })
    .flatMap((entry) => entry.outfit_items || []);

  const rejectedCombos = rejectedPicks.map((p) => p.items).filter(Boolean);

  const systemPrompt = `You are a premium personal AI stylist for an Indian fashion-conscious user. Pick THE SINGLE BEST outfit for today from their wardrobe.

CONTEXT:
- Today is ${dayName}, ${dateStr}
- Today's planned activity: ${todayOccasion}
- Weather: ${weather ? `${weather.temp_min}°C - ${weather.temp_max}°C, ${weather.weather_summary || 'clear'}, precipitation chance: ${weather.precipitation_chance || 0}%` : 'Not available'}
- User location: ${profile.location || 'India'}
- User style preferences: ${(profile.styles || []).join(', ') || 'not set'}

RULES:
- Use ONLY items from the wardrobe (reference by exact item ID)
- AVOID these recently worn item IDs (worn in last 7 days): ${JSON.stringify(recentItemIds)}
- AVOID these rejected outfit combinations: ${JSON.stringify(rejectedCombos)}
- Every outfit needs: top/ethnic_top + bottom/ethnic_bottom + footwear (OR ethnic_set + footwear)
- Consider today's weather carefully — don't suggest heavy fabrics in 35°C+ heat
- Consider the occasion — office needs smart_casual minimum, date_night needs date_worthy
- Pick the SINGLE BEST option, not multiple

Return a JSON object (NOT an array):
{
  "outfit_name": "The Tuesday Power Move",
  "vibe": "office_ready",
  "occasion": "${todayOccasion}",
  "items": {
    "top": { "item_id": "xxx", "name": "white oxford shirt" },
    "bottom": { "item_id": "xxx", "name": "navy chinos" },
    "footwear": { "item_id": "xxx", "name": "brown loafers" },
    "outerwear": null,
    "accessories": []
  },
  "color_palette": ["white", "navy", "brown"],
  "style_tip": "Roll up the sleeves for a relaxed vibe in this weather.",
  "best_for": "${todayOccasion}",
  "weather_note": "Perfect for today's 28°C with light breeze in Mumbai",
  "reasoning": "It's a warm Tuesday office day at 32°C in Mumbai. This breathable cotton shirt with chinos is ideal — you haven't worn the shirt in 10 days, and the navy-white combo is fresh and professional. The loafers elevate it from casual to smart-casual."
}

IMPORTANT:
- The "reasoning" field should explain WHY this outfit is perfect for TODAY specifically — mention the weather, occasion, and recency
- Be specific about Indian cities, weather, and culture
- Give the outfit a fun, relatable Indian name
- Return ONLY valid JSON, no markdown`;

  const wardrobeSummary = buildWardrobeSummary(wardrobe);
  const userMessage = JSON.stringify({
    wardrobe: wardrobeSummary,
    profile,
    weather,
    recent_items: recentItemIds,
  });

  return await callGroq(systemPrompt, userMessage);
}

export async function generateOccasionOutfits(wardrobe, profile, event) {
  const { type, venue, time, formality, notes, date } = event;

  const systemPrompt = `You are an elite Indian fashion stylist specializing in occasion-specific styling. Generate exactly 3 outfit options ranked by suitability for a specific event.

INDIAN OCCASION DRESS CODE KNOWLEDGE:
- Wedding Reception: Ethnic formal or Indo-Western. Men: sherwani/kurta-pyjama/bandhgala. Women: saree/lehenga/anarkali
- Sangeet: Festive, colorful. Sequins and shimmer welcome. Indo-Western fusion works well
- Haldi: Yellow and warm tones are traditional. Keep it washable — turmeric stains!
- Mehendi: Green tones, flowy ethnic, comfortable (long ceremony). Avoid white
- Engagement: Semi-formal to formal. Understated elegance over flashy
- Diwali Party: Festive ethnic. Rich fabrics — silk, brocade, velvet. Gold/jewel tones
- Navratri Garba: Bright colors, flowy fabrics that allow dancing. Traditional chaniya choli / colorful kurtas
- Eid Celebration: Elegant ethnic. White, pastels, or rich jewel tones. New clothes preferred
- Office Presentation: Smart formal. Clean lines, solid colors, well-fitted. Blazer recommended
- Client Meeting: Business formal. Conservative but stylish. No loud patterns
- Office Party: Smart casual with personality. Dressier than daily office wear
- First Date: Put-together but not trying too hard. Show personality. Fragrance is key
- Anniversary Dinner: Elevated, romantic. Rich colors. Dress up a notch from everyday
- House Party: Smart casual. Comfortable but curated. No gym wear
- Temple Visit: Modest, traditional. Ethnic preferred. Covered shoulders and knees
- Family Gathering: Clean ethnic casual. Comfortable but respectful
- College Farewell: Trendy, memorable outfit. Dress to impress. Indo-Western welcome
- Job Interview: Conservative, clean, well-fitted. Solid colors. Minimal accessories
- Festival/Puja: Traditional ethnic. Bright, auspicious colors. Clean and new if possible
- Travel: Comfortable, breathable, wrinkle-resistant. Layers for AC. Easy to move in
- Brunch: Smart casual. Light colors, relaxed fit. Sunday vibes

EVENT DETAILS:
- Type: ${type}
- Venue: ${venue || 'not specified'}
- Time: ${time || 'not specified'}
- Formality: ${formality || 'not specified'}
- Special notes: ${notes || 'none'}
${date ? `- Date: ${date}` : ''}

RULES:
- Use ONLY items from the provided wardrobe (reference by exact item ID)
- Generate exactly 3 outfits, ranked from BEST to 3rd best
- Each outfit needs: top/ethnic_top + bottom/ethnic_bottom + footwear (OR ethnic_set + footwear)
- Match the dress code of the occasion type listed above
- Consider venue (outdoor needs different shoes than indoor), time (evening = dressier), and user notes

Return a JSON array of exactly 3 outfit objects:
[
  {
    "rank": 1,
    "outfit_name": "The Showstopper",
    "vibe": "festive_glam",
    "occasion": "${type}",
    "items": {
      "top": { "item_id": "xxx", "name": "silk kurta" },
      "bottom": { "item_id": "xxx", "name": "churidar" },
      "footwear": { "item_id": "xxx", "name": "juttis" },
      "outerwear": null,
      "accessories": []
    },
    "color_palette": ["maroon", "gold"],
    "styling_instructions": "Pair the maroon silk kurta with the gold churidar. Roll the sleeves to show the cuff detailing. Add the ethnic stole draped over one shoulder for a regal touch.",
    "what_to_avoid": "Avoid sneakers or casual footwear — this is a dressy event. Skip the graphic tee underlayer.",
    "style_tip": "A watch and subtle cologne will complete this look perfectly.",
    "best_for": "${type}",
    "weather_note": "If it's an outdoor venue, the silk will breathe well in evening weather.",
    "completeness_score": 95,
    "missing_piece": null
  }
]

COMPLETENESS SCORING:
- 100: Perfect outfit, nothing missing
- 80-99: Great outfit, could add one accessory or swap one piece
- 60-79: Decent outfit but missing a key element — specify what to buy in "missing_piece"
- Below 60: Don't include this outfit, wardrobe doesn't support this occasion well

If completeness < 80, add "missing_piece":
{
  "item_type": "ethnic stole",
  "why": "Would add the finishing touch for a wedding reception",
  "search_query": "silk ethnic stole men wedding",
  "estimated_price": "₹800-2000"
}

IMPORTANT:
- "styling_instructions" should be DETAILED and actionable — how to wear each piece, tuck/untuck, sleeve position, layering order
- "what_to_avoid" should be specific to THIS event type
- Give creative outfit names that feel premium
- Be honest about completeness — don't force outfits if the wardrobe doesn't support the occasion
- Return ONLY valid JSON array, no markdown`;

  const wardrobeSummary = buildWardrobeSummary(wardrobe);
  const userMessage = JSON.stringify({
    wardrobe: wardrobeSummary,
    profile,
    event: { type, venue, time, formality, notes, date },
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
