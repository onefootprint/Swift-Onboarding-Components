import debounce from 'lodash/debounce';
import { useCallback, useRef, useState } from 'react';

import type { AddressPrediction } from '../address-input.types';

type PredictionCache = Record<string, AddressPrediction[]>;

const apiKey = 'AIzaSyCgSmhug-DYfU5ozUNCyTfKyVX3VvPTSUs'; // process.env.GOOGLE_MAPS_API_KEY;

const useGoogleMapsPredictions = (countryCode: string) => {
  const [data, setData] = useState<AddressPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cache = useRef<PredictionCache>({});

  const fetchPredictions = async (address: string) => {
    if (address.length <= 2) {
      setData([]);
      return;
    }

    const cacheKey = `${address}-${countryCode}`;
    if (cache.current[cacheKey]) {
      setData(cache.current[cacheKey]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        address,
      )}&key=${apiKey}`;

      if (countryCode) {
        apiUrl += `&components=country:${countryCode}`;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Google Maps API Error: ${response.status}`);
      }

      const json = await response.json();
      if (json.status !== 'OK') {
        throw new Error(`Google Maps API returned an error: ${json.error_message}`);
      }

      setData(json.predictions);
      cache.current[cacheKey] = json.predictions;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedPredictions = useCallback(
    debounce(fetchPredictions, 200, {
      leading: true,
      trailing: true,
    }),
    [countryCode],
  );

  const mutate = (address: string) => {
    debouncedPredictions(address);
  };

  const reset = () => {
    setData([]);
  };

  return { data, isLoading, error, mutate, reset };
};

export default useGoogleMapsPredictions;
