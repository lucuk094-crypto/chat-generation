import axios from 'axios';

export async function generateFakeFF(nickname: string): Promise<Buffer> {
  try {
    const response = await axios.get(`https://api.nexadev.my.id/maker/fakeff`, {
      params: {
        nickname: nickname
      },
      responseType: 'arraybuffer'
    });

    return Buffer.from(response.data);
  } catch (error: any) {
    console.error('Failed to generate Fake FF:', error);
    throw new Error(error.response?.data?.message || 'Failed to generate Fake FF image');
  }
}
