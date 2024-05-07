import { type Entity, IdentifyScope, type Liveness } from '@onefootprint/types';
import { Divider, MultiSelect, Text } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { Marker } from '../map';
import Map from '../map';
import AddressCard from './components/address-card';
import AddressCardIcon from './components/address-card/components/address-card-icon';
import AddressType from './components/address-card/types';
import ContainerWithToggle from './components/container-with-toggle';
import InsightEventCard from './components/insight-event-card';
import useAddressCoordinates from './hooks/use-address-coordinates';
import useMultiSelectOptions from './hooks/use-multi-select-options';
import getIconForLivenessEvent from './utils/get-icon-for-liveness-event';
import getKeyForLiveness from './utils/get-key-for-liveness';

export type ContentProps = {
  entity: Entity;
  livenessData: Liveness[];
};

const Content = ({ entity, livenessData }: ContentProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.device-insights',
  });
  const [detailsHidden, setDetailsHidden] = useState(false);
  const cards: JSX.Element[] = [];
  const allMarkers: (Marker | null)[] = [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const {
    options,
    isOnboardingSelected,
    isAuthSelected,
    isBusinessAddressSelected,
    isResidentialAddressSelected,
    handleOptionsChange,
  } = useMultiSelectOptions(entity, livenessData);

  let insightEvents = livenessData;
  if (!isOnboardingSelected) {
    insightEvents = insightEvents.filter(
      liveness => liveness.scope !== IdentifyScope.onboarding,
    );
  }
  if (!isAuthSelected) {
    insightEvents = insightEvents.filter(
      liveness => liveness.scope !== IdentifyScope.auth,
    );
  }
  insightEvents.forEach(liveness => {
    const lat = liveness.insight.latitude;
    const lng = liveness.insight.longitude;
    const isSelected = selectedIndex === allMarkers.length;
    cards.push(
      <InsightEventCard
        key={getKeyForLiveness(liveness)}
        liveness={liveness}
      />,
    );
    if (lat !== null && lng !== null) {
      allMarkers.push({
        lat,
        lng,
        icon: getIconForLivenessEvent(
          liveness,
          isSelected ? 'quinary' : 'primary',
        ),
        isSelected,
      });
    } else {
      allMarkers.push(null);
    }
  });

  const {
    lat: businessLat,
    lng: businessLng,
    isLoading: businessCoordLoading,
  } = useAddressCoordinates(entity, AddressType.business);
  if (isBusinessAddressSelected) {
    cards.push(
      <AddressCard
        key={AddressType.business}
        type={AddressType.business}
        entity={entity}
        isLoading={businessCoordLoading}
      />,
    );

    if (businessLat && businessLng) {
      const isSelected = selectedIndex === allMarkers.length;
      allMarkers.push({
        lat: businessLat,
        lng: businessLng,
        icon: (
          <AddressCardIcon
            type={AddressType.business}
            color={isSelected ? 'quinary' : 'primary'}
          />
        ),
        isSelected,
      });
    } else {
      allMarkers.push(null);
    }
  }

  const {
    lat: residentialLat,
    lng: residentialLng,
    isLoading: residentialCoordLoading,
  } = useAddressCoordinates(entity, AddressType.residential);
  if (isResidentialAddressSelected) {
    cards.push(
      <AddressCard
        key={AddressType.residential}
        type={AddressType.residential}
        entity={entity}
        isLoading={residentialCoordLoading}
      />,
    );

    if (residentialLat && residentialLng) {
      const isSelected = selectedIndex === allMarkers.length;
      allMarkers.push({
        lat: residentialLat,
        lng: residentialLng,
        icon: (
          <AddressCardIcon
            type={AddressType.residential}
            color={isSelected ? 'quinary' : 'primary'}
          />
        ),
        isSelected,
      });
    } else {
      allMarkers.push(null);
    }
  }

  const markers = allMarkers.filter(Boolean) as Marker[];

  return (
    <Container>
      <ContainerWithToggle
        isHidden={detailsHidden}
        onChangeHidden={setDetailsHidden}
      >
        <MultiSelect
          defaultValue={options}
          options={options}
          onChange={handleOptionsChange}
        />
        <StyledDivider />
        <CardsContainer>
          {!cards.length && (
            <Text variant="body-3" color="tertiary">
              {t('empty')}
            </Text>
          )}
          {cards.map((card, index) =>
            React.cloneElement(card, {
              isSelected: selectedIndex === index,
              onSelect: () => setSelectedIndex(index),
            }),
          )}
        </CardsContainer>
      </ContainerWithToggle>
      <MapContainer data-smaller={!detailsHidden}>
        <Map markers={markers} />
      </MapContainer>
    </Container>
  );
};

const MapContainer = styled.div`
  ${({ theme }) => css`
    height: 584px;
    width: 100%;
    height: calc(100% + 20px);
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    position: relative;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    transition: transform 0.3s ease-in-out;
    transform: translateX(0);

    &[data-smaller='true'] {
      transform: translateX(214px);
    }
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    height: 584px;
    width: 100%;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    position: relative;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const CardsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    overflow-y: auto;
    padding-top: ${theme.spacing[3]};
  `}
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[3]};
  `}
`;

export default Content;
