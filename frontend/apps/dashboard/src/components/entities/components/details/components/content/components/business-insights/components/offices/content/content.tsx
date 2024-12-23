import { IcoForbid40 } from '@onefootprint/icons';
import type { BusinessAddress } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import MapComponent from '../map';
import MapMarker from '../map/components/map-marker';
import AddressCard from './components/address-card';
import ContainerWithToggle from './components/container-with-toggle';
import useAddressCoordinates from './hooks/use-address-coordinates';

export type OfficesProps = {
  data: BusinessAddress[];
};

const Content = ({ data }: OfficesProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'business-insights.offices',
  });
  const [detailsHidden, setDetailsHidden] = useState(false);
  const dataWithCoordinates = data.map(address => {
    const { data: coordinates } = useAddressCoordinates(address);
    return {
      ...address,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
    } as BusinessAddress;
  });
  const firstWithCoordinates = dataWithCoordinates.find(address => address.latitude && address.longitude);
  const [selectedAddress, setSelectedAddress] = useState<BusinessAddress | undefined>(firstWithCoordinates);

  useEffect(() => {
    if (firstWithCoordinates && !selectedAddress) {
      setSelectedAddress(firstWithCoordinates);
    }
  }, [firstWithCoordinates]);

  const cards: JSX.Element[] = [];
  const markers: JSX.Element[] = [];
  dataWithCoordinates.forEach(address => {
    const isSelected = selectedAddress?.id === address.id;
    cards.push(
      <AddressCard key={address.id} address={address} isSelected={isSelected} onSelect={setSelectedAddress} />,
    );
    if (!!address.latitude && !!address.longitude) {
      markers.push(
        <MapMarker
          key={address.id}
          id={address.id}
          onClick={() => handleSelectFromMap(address)}
          latitude={address.latitude}
          longitude={address.longitude}
          isSelected={isSelected}
        />,
      );
    }
  });

  if (!cards.length) {
    cards.push(
      <Stack
        key="empty"
        direction="column"
        gap={6}
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
        style={{ width: '100%', height: '100%' }}
      >
        <IcoForbid40 />
        <Text variant="label-2">{t('empty')}</Text>
      </Stack>,
    );
  }

  const handleSelectFromMap = (address: BusinessAddress) => {
    setSelectedAddress(address);
    const card = document.getElementById(`offices-card-${address.id}`);
    const parent = card?.parentElement;
    if (card && parent) {
      parent.scrollTo({
        top: card.offsetTop,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Container>
      <ContainerWithToggle isHidden={detailsHidden} onChangeHidden={setDetailsHidden}>
        <CardsContainer>{cards}</CardsContainer>
      </ContainerWithToggle>
      <MapContainer data-has-overlay={!detailsHidden}>
        <MapComponent
          markers={markers}
          selectedAddress={selectedAddress}
          onSelect={id =>
            handleSelectFromMap(dataWithCoordinates.find(address => address.id === id) as BusinessAddress)
          }
        />
      </MapContainer>
    </Container>
  );
};

const MapContainer = styled.div`
  ${({ theme }) => css`
    height: 584px;
    width: 100%;
    height: 100%;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    position: relative;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    transition: transform 0.3s ease-in-out;
    transform: translateX(0);

    &[data-has-overlay='true'] {
      transform: translateX(214px);
    }
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    position: relative;
    height: 584px;
    width: 100%;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const CardsContainer = styled.div`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    height: 100%;
    overflow-y: scroll;
    box-sizing: content-box;
    padding-right: 35px;
    width: 100%;
    padding-top: ${theme.spacing[3]};
    padding-bottom: ${theme.spacing[4]};
  `}
`;

export default Content;
