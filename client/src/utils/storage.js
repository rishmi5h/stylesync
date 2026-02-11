const KEYS = {
  WARDROBE: 'stylesync_wardrobe',
  PROFILE: 'stylesync_profile',
  OUTFITS: 'stylesync_outfits',
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
