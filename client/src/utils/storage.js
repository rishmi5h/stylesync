const KEYS = {
  WARDROBE: 'stylesync_wardrobe',
  PROFILE: 'stylesync_profile',
  OUTFITS: 'stylesync_outfits',
  WEAR_HISTORY: 'stylesync_wear_history',
  TODAY_PICK: 'stylesync_today_pick',
};

export function getWardrobe() {
  try {
    const data = localStorage.getItem(KEYS.WARDROBE);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveWardrobe(items) {
  try {
    localStorage.setItem(KEYS.WARDROBE, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save wardrobe:', error);
  }
}

export function addWardrobeItem(item) {
  try {
    const wardrobe = getWardrobe();
    const newItem = { ...item, id: crypto.randomUUID() };
    wardrobe.push(newItem);
    saveWardrobe(wardrobe);
    return newItem;
  } catch (error) {
    console.error('Failed to add wardrobe item:', error);
    return null;
  }
}

export function removeWardrobeItem(id) {
  try {
    const wardrobe = getWardrobe();
    const filtered = wardrobe.filter((item) => item.id !== id);
    saveWardrobe(filtered);
    return filtered;
  } catch (error) {
    console.error('Failed to remove wardrobe item:', error);
    return null;
  }
}

export function updateWardrobeItem(id, updates) {
  try {
    const wardrobe = getWardrobe();
    const index = wardrobe.findIndex((item) => item.id === id);
    if (index === -1) return null;
    wardrobe[index] = { ...wardrobe[index], ...updates };
    saveWardrobe(wardrobe);
    return wardrobe[index];
  } catch (error) {
    console.error('Failed to update wardrobe item:', error);
    return null;
  }
}

export function getProfile() {
  try {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save profile:', error);
  }
}

export function getOutfitPlan() {
  try {
    const data = localStorage.getItem(KEYS.OUTFITS);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveOutfitPlan(plan) {
  try {
    localStorage.setItem(KEYS.OUTFITS, JSON.stringify(plan));
  } catch (error) {
    console.error('Failed to save outfit plan:', error);
  }
}

// --- Wear History ---

export function getWearHistory() {
  try {
    const data = localStorage.getItem(KEYS.WEAR_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addWearEntry(outfitItems, outfitName) {
  try {
    const history = getWearHistory();
    history.push({
      date: new Date().toISOString().split('T')[0],
      outfit_items: outfitItems,
      outfit_name: outfitName,
    });
    // Keep last 90 days only
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const filtered = history.filter((e) => new Date(e.date) >= cutoff);
    localStorage.setItem(KEYS.WEAR_HISTORY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to save wear entry:', error);
  }
}

// --- Today's Pick Cache ---

export function getTodayPick() {
  try {
    const data = localStorage.getItem(KEYS.TODAY_PICK);
    if (!data) return null;
    const parsed = JSON.parse(data);
    const today = new Date().toISOString().split('T')[0];
    // Only return if it's today's pick
    if (parsed.date === today) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveTodayPick(outfit) {
  try {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(KEYS.TODAY_PICK, JSON.stringify({ date: today, outfit }));
  } catch (error) {
    console.error('Failed to save today\'s pick:', error);
  }
}
