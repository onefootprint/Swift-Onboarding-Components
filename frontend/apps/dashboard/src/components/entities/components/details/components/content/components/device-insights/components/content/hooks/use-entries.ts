import type { Color } from '@onefootprint/design-tokens';
import type { AuthEvent, Entity } from '@onefootprint/types';
import { IdentifyScope } from '@onefootprint/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { MapMarkerProps } from '../../map/components/map-marker';
import AddressType from '../components/address-card/types';
import getIconForAddress from '../utils/get-icon-for-address';
import getIconForLivenessEvent from '../utils/get-icon-for-liveness-event';
import getKeyForLiveness from '../utils/get-key-for-liveness-event';
import useAddressCoordinates from './use-address-coordinates';
import type { MultiSelectOption } from './use-multi-select-options';
import { MultiSelectOptionValue } from './use-multi-select-options';

type Entry = {
  id: string; // unique id
  type: MultiSelectOptionValue;
  coordinates?: { lat: number; lng: number };
  data?: AuthEvent;
  cardisPending?: boolean;
  marker?: MapMarkerProps;
  liveness?: AuthEvent;
};

const useEntries = (entity: Entity, livenessData: AuthEvent[], options: MultiSelectOption[]) => {
  const {
    data: businessData,
    isPending: businessCoordLoading,
    isError: businessError,
  } = useAddressCoordinates(entity, AddressType.business);

  const {
    data: residentialData,
    isPending: residentialCoordLoading,
    isError: residentialError,
  } = useAddressCoordinates(entity, AddressType.residential);

  const entries = useMemo(() => {
    const selectedOptionsSet = new Set(options.map(option => option.value));

    const innerEntries: Record<string, Entry> = {};

    livenessData
      .filter(liveness => {
        if (!selectedOptionsSet.has(MultiSelectOptionValue.onboarding) && liveness.scope === IdentifyScope.onboarding) {
          return false;
        }
        if (!selectedOptionsSet.has(MultiSelectOptionValue.auth) && liveness.scope === IdentifyScope.auth) {
          return false;
        }
        return true;
      })
      .forEach(liveness => {
        const lat = liveness.insight.latitude;
        const lng = liveness.insight.longitude;
        const hasCoords = lat !== null && lng !== null;
        const id = getKeyForLiveness(liveness);
        innerEntries[id] = {
          id,
          type:
            liveness.scope === IdentifyScope.onboarding
              ? MultiSelectOptionValue.onboarding
              : MultiSelectOptionValue.auth,
          coordinates: hasCoords ? { lat, lng } : undefined,
          data: liveness,
          marker: hasCoords
            ? {
                id,
                lat,
                lng,
                getIcon: (color?: Color) => getIconForLivenessEvent(liveness, color, 'small'),
              }
            : undefined,
        };
      });

    const isBusinessAddressSelected = selectedOptionsSet.has(MultiSelectOptionValue.businessAddress);
    if (isBusinessAddressSelected) {
      const { lat: businessLat, lng: businessLng } = businessData || {};
      const hasCoords = businessLat !== undefined && businessLng !== undefined;
      const id = 'business';
      innerEntries[id] = {
        id,
        type: MultiSelectOptionValue.businessAddress,
        coordinates: hasCoords ? { lat: businessLat, lng: businessLng } : undefined,
        cardisPending: businessCoordLoading && !businessError,
        marker: hasCoords
          ? {
              id,
              lat: businessLat,
              lng: businessLng,
              getIcon: (color?: Color) => getIconForAddress(AddressType.business, color, 'small'),
            }
          : undefined,
      };
    }
    const isResidentialAddressSelected = selectedOptionsSet.has(MultiSelectOptionValue.residentialAddress);
    if (isResidentialAddressSelected) {
      const { lat: residentialLat, lng: residentialLng } = residentialData || {};
      const hasCoords = residentialLat !== undefined && residentialLng !== undefined;
      const id = 'residential';
      innerEntries[id] = {
        id,
        type: MultiSelectOptionValue.residentialAddress,
        coordinates: hasCoords ? { lat: residentialLat, lng: residentialLng } : undefined,
        cardisPending: residentialCoordLoading && !residentialError,
        marker: hasCoords
          ? {
              id,
              lat: residentialLat,
              lng: residentialLng,
              getIcon: (color?: Color) => getIconForAddress(AddressType.residential, color, 'small'),
            }
          : undefined,
      };
    }

    return innerEntries;
  }, [
    options,
    livenessData,
    businessCoordLoading,
    businessData,
    businessError,
    residentialCoordLoading,
    residentialData,
    residentialError,
  ]);

  const getDefaultSelectedId = useCallback(() => {
    // Find the first entry with coordinates and select that by default
    const entryWithCoords = Object.values(entries).find(entry => entry.coordinates !== undefined);
    return entryWithCoords ? entryWithCoords.id : null;
  }, [entries]);

  const [selectedId, setSelectedId] = useState<string | null>(getDefaultSelectedId());
  const onSelectedIdChange = (id: string) => {
    if (selectedId !== id) {
      setSelectedId(id);
    }
  };

  useEffect(() => {
    if (!selectedId || (selectedId && !entries[selectedId])) {
      // Find the first entry with coordinates and select that by default
      setSelectedId(getDefaultSelectedId());
    }
  }, [getDefaultSelectedId, entries, selectedId]);

  const selectedCoords = selectedId ? entries[selectedId]?.coordinates : undefined;

  return { entries, selectedCoords, selectedId, onSelectedIdChange };
};

export default useEntries;
