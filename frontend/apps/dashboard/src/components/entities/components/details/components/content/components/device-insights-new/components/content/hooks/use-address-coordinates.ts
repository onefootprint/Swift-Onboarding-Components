import type { Entity } from '@onefootprint/types';
import { useEffect, useState } from 'react';

import type AddressType from '../components/address-card/types';
import useAddressFieldsProps from './use-address-fields-props';

const getCoordinatesFromAddress = async (address: string) => {
  const geocoder = new google.maps.Geocoder();
  try {
    const result = await geocoder.geocode({ address });
    return {
      lat: result.results[0].geometry.location.lat(),
      lng: result.results[0].geometry.location.lng(),
    };
  } catch (error) {
    return undefined;
  }
};

const useAddressCoordinates = (entity: Entity, type: AddressType) => {
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();

  const { getAddressFieldsProps } = useAddressFieldsProps(entity);
  const addressProps = getAddressFieldsProps(type);
  const encryptedFields = addressProps.filter(prop => !prop.isDecrypted);
  const hasCompleteAddress = encryptedFields.length === 0;
  const [isLoading, setIsLoading] = useState<boolean>();
  const completeAddress = addressProps.map(prop => prop.value).join(', ');

  useEffect(() => {
    if (!hasCompleteAddress || isLoading) {
      return;
    }
    if (typeof lat !== 'undefined' || typeof lng !== 'undefined') {
      return;
    }
    setIsLoading(true);
    getCoordinatesFromAddress(completeAddress)
      .then(coordinates => {
        if (coordinates) {
          if (coordinates.lat !== lat) {
            setLat(coordinates.lat);
          }
          if (coordinates.lng !== lng) {
            setLng(coordinates.lng);
          }
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [hasCompleteAddress, completeAddress, lat, lng, isLoading]);

  return { lat, lng, isLoading };
};

export default useAddressCoordinates;
