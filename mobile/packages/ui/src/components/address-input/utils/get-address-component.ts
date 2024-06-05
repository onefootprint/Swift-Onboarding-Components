import type { AddressPlace } from '../address-input.types';

const apiKey = 'AIzaSyCgSmhug-DYfU5ozUNCyTfKyVX3VvPTSUs'; // process.env.GOOGLE_MAPS_API_KEY;

const getGoogleMapsAddressDetails = async (
  placeId: string,
  lang?: 'spanish' | 'english',
): Promise<AddressPlace | null> => {
  try {
    const languageParam = lang === 'spanish' ? '&language=es' : '';
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}${languageParam}`,
    );
    if (!response.ok) {
      throw new Error(`Google Maps API Error: ${response.status}`);
    }
    const data = await response.json();
    return data.result as AddressPlace | null;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred during the network request');
    }
  }
};

export default getGoogleMapsAddressDetails;
