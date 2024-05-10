import { IcoForbid40 } from '@onefootprint/icons';
import { type Entity, type Liveness } from '@onefootprint/types';
import { Divider, MultiSelect, Stack, Text } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Map from '../map';
import MapMarker from '../map/components/map-marker';
import AddressCard from './components/address-card';
import AddressType from './components/address-card/types';
import ContainerWithToggle from './components/container-with-toggle';
import InsightEventCard from './components/insight-event-card';
import useEntries from './hooks/use-entries';
import useMultiSelectOptions, {
  MultiSelectOptionValue,
} from './hooks/use-multi-select-options';

export type ContentProps = {
  entity: Entity;
  livenessData: Liveness[];
};

const Content = ({ entity, livenessData }: ContentProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.device-insights',
  });
  const [detailsHidden, setDetailsHidden] = useState(false);

  const { allOptions, selectedOptions, handleOptionsChange } =
    useMultiSelectOptions(entity, livenessData);

  const { entries, selectedCoords, selectedId, onSelectedIdChange } =
    useEntries(entity, livenessData, selectedOptions);

  const cards: JSX.Element[] = [];
  const markers: JSX.Element[] = [];
  Object.entries(entries).forEach(([id, entry]) => {
    const isSelected = selectedId === id;
    if (
      entry.type === MultiSelectOptionValue.businessAddress ||
      entry.type === MultiSelectOptionValue.residentialAddress
    ) {
      const type =
        entry.type === MultiSelectOptionValue.businessAddress
          ? AddressType.business
          : AddressType.residential;
      cards.push(
        <AddressCard
          id={id}
          key={id}
          type={type}
          entity={entity}
          isLoading={entry.cardIsLoading}
          isSelected={isSelected}
          onSelect={onSelectedIdChange}
        />,
      );
    } else if (entry.data) {
      cards.push(
        <InsightEventCard
          id={id}
          key={id}
          liveness={entry.data}
          isSelected={isSelected}
          onSelect={onSelectedIdChange}
        />,
      );
    }
    if (entry.marker) {
      markers.push(
        <MapMarker
          key={id}
          id={id}
          lat={entry.marker.lat}
          lng={entry.marker.lng}
          getIcon={entry.marker.getIcon}
          isSelected={isSelected}
        />,
      );
    }
  });

  if (!cards.length) {
    cards.push(
      <Stack
        display="flex"
        direction="column"
        gap={6}
        justify="center"
        justifyContent="center"
        alignItems="center"
        padding={5}
        flexGrow={1}
        style={{ width: '100%', height: '100%' }}
      >
        <IcoForbid40 />
        <Stack
          width="100%"
          display="flex"
          direction="column"
          gap={3}
          justifyContent="center"
          alignItems="center"
        >
          <Text key="empty" variant="label-2">
            {t('empty.title')}
          </Text>
          <Text key="empty" variant="body-2" textAlign="center">
            {t('empty.description')}
          </Text>
        </Stack>
      </Stack>,
    );
  }

  const handleSelectFromMap = (id: string) => {
    onSelectedIdChange(id);
    // Find the card with the selected id and scroll to it
    const card = document.getElementById(`device-insights-card-${id}`);
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
      <ContainerWithToggle
        isHidden={detailsHidden}
        onChangeHidden={setDetailsHidden}
      >
        <MultiSelect
          placeholder={t('select.placeholder')}
          options={allOptions}
          value={selectedOptions}
          onChange={handleOptionsChange}
        />
        <StyledDivider />
        <CardsContainer>{cards}</CardsContainer>
      </ContainerWithToggle>
      <MapContainer data-has-overlay={!detailsHidden}>
        <Map
          markers={markers}
          selectedCoords={selectedCoords}
          onSelect={handleSelectFromMap}
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

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[3]};
  `}
`;

export default Content;
