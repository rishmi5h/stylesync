import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];

const CLASSIFICATION_PROMPT = `You are an expert Indian fashion analyst and clothing classification system. You specialize in Indian wardrobes, Indian weather conditions, and both Western and traditional Indian clothing.

CONTEXT: This app is used by people in India. Indian weather has 4 key seasons:
- Summer (March-June): Extreme heat 35-48°C, need breathable lightweight fabrics
- Monsoon/Rainy (July-September): Heavy rain & humidity, need quick-dry and water-resistant fabrics
- Autumn/Mild (October-November): Pleasant 20-30°C, transitional clothing
- Winter (December-February): 5-20°C in most cities (colder in North India), need layers and warm fabrics

STEP 1 - Identify the item: Look at the overall shape, silhouette, and structure. Is it Western wear, Indian ethnic wear, or Indo-Western fusion?

STEP 2 - Analyze details: Examine fabric texture, color shades, patterns, embroidery, prints, stitching, buttons, zippers, collars, cuffs, and any branding visible.

STEP 3 - Return a JSON object with these fields:

{
  "category": "(MUST be one of: top, bottom, outerwear, footwear, accessory, innerwear, ethnic_top, ethnic_bottom, ethnic_set)",
  "subcategory": "(be VERY specific, examples below)",
  "color": "(exact shade - e.g., 'maroon', 'mustard yellow', 'teal blue', 'off-white', 'bottle green')",
  "pattern": "(one of: solid, striped, plaid, checkered, floral, graphic, abstract, color-block, paisley, polka-dot, geometric, tie-dye, animal-print, textured, block-print, bandhani, ikat, chikankari, embroidered, printed, self-textured)",
  "fabric_guess": "(be specific - e.g., pure cotton, cotton-linen blend, khadi cotton, chanderi silk, raw silk, art silk, georgette, chiffon, crepe, rayon, viscose, modal, polyester blend, stretch denim, raw denim, linen, terry cotton, dry-fit polyester, fleece, wool blend, leather, suede, canvas, nylon)",
  "formality": "(one of: casual, smart_casual, semi_formal, formal, festive, ethnic_casual, ethnic_formal)",
  "season": "(one of: summer, winter, all_season, rainy — based on Indian climate)",
  "weather_suitability": "(describe ideal Indian weather - e.g., 'Best for peak summer 35°C+, very breathable', 'Good for AC offices and mild winter', 'Monsoon-friendly, quick-dry fabric')",
  "fit": "(one of: slim, regular, relaxed, oversized, tailored, flowy — based on the garment's cut)",
  "condition": "(one of: new, like_new, good, fair — based on visible wear)",
  "versatility": "(rate 1-5, 5 = pairs with everything)",
  "occasion_tags": "(array of suitable occasions from: daily_wear, office, college, date_night, party, wedding_guest, festive, puja, casual_outing, travel, workout, lounge, brunch)",
  "care_tip": "(one short tip - e.g., 'Machine wash cold, avoid direct sun drying', 'Dry clean only', 'Hand wash to maintain print')",
  "description": "(specific one-line description that an Indian shopper would understand)"
}

SUBCATEGORY EXAMPLES:
- Western tops: crew-neck t-shirt, V-neck t-shirt, polo t-shirt, henley, oxford shirt, casual check shirt, linen shirt, graphic tee, tank top, crop top
- Indian ethnic tops: kurta, short kurta, straight kurta, Nehru collar shirt, angrakha kurta, mirror-work top, chikankari kurti, block-print kurti
- Western bottoms: slim jeans, straight jeans, joggers, chinos, cargo pants, cotton trousers, shorts, track pants
- Indian ethnic bottoms: churidar, patiala salwar, palazzo pants, dhoti pants, straight pants, lycra leggings
- Ethnic sets: kurta-pyjama set, kurta-churidar set, sherwani set, pathani suit, salwar kameez set, lehenga set, anarkali set, saree
- Outerwear: nehru jacket, waistcoat, bomber jacket, denim jacket, hoodie, blazer, sports jacket, windcheater, light cardigan
- Footwear: kolhapuri chappal, juttis/mojari, sneakers, white sneakers, loafers, formal shoes, sports shoes, sandals, floaters, ethnic sandals, chelsea boots
- Accessories: analog watch, digital watch, sunglasses, backpack, sling bag, wallet, ethnic stole/dupatta, belt, cap, bracelet

INDIAN SEASON GUIDE for classification:
- "summer": Light cotton, linen, khadi, rayon, sleeveless/half-sleeve, breathable — for 30°C+
- "rainy": Quick-dry polyester, dark colors (hide stains), waterproof footwear, avoid silk/suede
- "winter": Wool, fleece, layering pieces, full-sleeve, jackets — for below 20°C
- "all_season": Cotton blend, medium weight, versatile pieces that work year-round in AC environments

IMPORTANT:
- Recognize both Western AND Indian traditional clothing
- If it's a kurta, don't call it a "shirt". If it's a kurti, don't call it a "top"
- Indian patterns like bandhani, ikat, block-print, chikankari should be identified correctly
- Consider Indian office culture: kurta with chinos is smart_casual, not just ethnic
- Festival/wedding clothes should be tagged as "festive" or "ethnic_formal"
- Return ONLY valid JSON, no markdown formatting, no code fences, no extra text`;

export async function classifyItem(imageBase64, mimeType) {
  if (!genAI) {
    throw new Error('Gemini API key is not configured. Add GEMINI_API_KEY to your .env file.');
  }

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType,
    },
  };

  let lastError;

  for (const modelName of MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
      });

      const result = await model.generateContent([CLASSIFICATION_PROMPT, imagePart]);
      const response = await result.response;
      let text = response.text();

      // Strip markdown code fences if present
      text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

      const classification = JSON.parse(text);

      // Validate required fields exist
      const requiredFields = ['category', 'subcategory', 'color', 'pattern', 'fabric_guess', 'formality', 'season', 'description'];
      for (const field of requiredFields) {
        if (!classification[field]) {
          console.warn(`Missing field: ${field}, re-requesting...`);
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Normalize category to allowed values
      const validCategories = ['top', 'bottom', 'outerwear', 'footwear', 'accessory', 'innerwear', 'ethnic_top', 'ethnic_bottom', 'ethnic_set'];
      if (!validCategories.includes(classification.category)) {
        const categoryMap = {
          'shirt': 'top', 'tshirt': 'top', 't-shirt': 'top', 'blouse': 'top',
          'kurta': 'ethnic_top', 'kurti': 'ethnic_top',
          'pants': 'bottom', 'jeans': 'bottom', 'shorts': 'bottom', 'skirt': 'bottom', 'trousers': 'bottom', 'chinos': 'bottom',
          'churidar': 'ethnic_bottom', 'salwar': 'ethnic_bottom', 'palazzo': 'ethnic_bottom', 'patiala': 'ethnic_bottom', 'dhoti': 'ethnic_bottom', 'leggings': 'ethnic_bottom',
          'saree': 'ethnic_set', 'lehenga': 'ethnic_set', 'sherwani': 'ethnic_set', 'anarkali': 'ethnic_set',
          'jacket': 'outerwear', 'coat': 'outerwear', 'hoodie': 'outerwear', 'sweater': 'outerwear', 'blazer': 'outerwear', 'nehru_jacket': 'outerwear', 'waistcoat': 'outerwear',
          'shoes': 'footwear', 'boots': 'footwear', 'sandals': 'footwear', 'sneakers': 'footwear', 'chappal': 'footwear', 'juttis': 'footwear', 'mojari': 'footwear', 'kolhapuri': 'footwear', 'floaters': 'footwear',
          'watch': 'accessory', 'hat': 'accessory', 'bag': 'accessory', 'belt': 'accessory', 'dupatta': 'accessory', 'stole': 'accessory', 'sunglasses': 'accessory',
          'underwear': 'innerwear', 'socks': 'innerwear', 'bra': 'innerwear', 'vest': 'innerwear',
        };
        const mapped = categoryMap[classification.category.toLowerCase()];
        if (mapped) {
          classification.category = mapped;
        } else {
          classification.category = 'accessory';
        }
      }

      console.log(`Successfully classified: ${classification.subcategory} (${classification.category})`);
      return classification;
    } catch (error) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;

      if (error.message?.includes('429') || error.message?.includes('quota')) {
        continue;
      }
      if (error.message?.includes('Missing required field')) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    'All Gemini models are rate-limited. Your free tier daily quota may be exhausted. Please wait a few minutes and try again, or check your quota at https://ai.dev/rate-limit'
  );
}
