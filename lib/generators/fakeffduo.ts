// Fake FF Duo Generator using external API
export interface FakeFFDuoOptions {
  nickname1: string;
  nickname2: string;
}

export async function generateFakeFFDuo(options: FakeFFDuoOptions): Promise<string> {
  const { nickname1, nickname2 } = options;
  
  try {
    // Build URL with query parameters
    const params = [
      `nickname1=${encodeURIComponent(nickname1.trim())}`,
      `nickname2=${encodeURIComponent(nickname2.trim())}`
    ];
    
    const fullUrl = `https://apii.nexadev.my.id/fakeffduo?${params.join('&')}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Check if response is JSON or image
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      // API returns JSON with url field
      const data = await response.json();
      if (!data.url) {
        throw new Error('Invalid response from API: missing url field');
      }
      
      // Fetch the actual image from the URL
      const imageResponse = await fetch(data.url);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image from URL');
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      return `data:image/png;base64,${base64Image}`;
    } else {
      // API returns image directly
      const imageBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      
      // Detect image type from content-type or default to png
      let mimeType = 'image/png';
      if (contentType) {
        if (contentType.includes('png')) mimeType = 'image/png';
        else if (contentType.includes('jpeg') || contentType.includes('jpg')) mimeType = 'image/jpeg';
      }
      
      return `data:${mimeType};base64,${base64Image}`;
    }
  } catch (error) {
    console.error('Error generating Fake FF Duo:', error);
    throw error;
  }
}
