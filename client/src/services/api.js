const API_BASE = '/api';

export async function classifyItem(imageFile) {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE}/classify`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Classification failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to reach the server. Please check your connection.');
    }
    throw error;
  }
}

export async function generateOutfitIdeas(wardrobe, profile, filters = {}) {
  try {
    const response = await fetch(`${API_BASE}/outfits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wardrobe, profile, filters }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Outfit generation failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to reach the server. Please check your connection.');
    }
    throw error;
  }
}

export async function generateRecommendations(wardrobe, profile) {
  try {
    const response = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wardrobe, profile }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Recommendation generation failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to reach the server. Please check your connection.');
    }
    throw error;
  }
}

export async function getWeather(city) {
  try {
    const response = await fetch(
      `${API_BASE}/weather?city=${encodeURIComponent(city)}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Weather fetch failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to reach the server. Please check your connection.');
    }
    throw error;
  }
}
