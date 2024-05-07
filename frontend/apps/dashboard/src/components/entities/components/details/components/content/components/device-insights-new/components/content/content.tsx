import {
  BusinessDI,
  type Entity,
  IdDI,
  IdentifyScope,
  type Liveness,
} from '@onefootprint/types';
import { Divider, MultiSelect, Text } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { Marker } from '../map';
import Map from '../map';
import AddressCard from './components/address-card';
import { AddressType } from './components/address-card/types';
import ContainerWithToggle from './components/container-with-toggle';
import InsightEventCard from './components/insight-event-card';
import getIconForLivenessEvent from './utils/get-icon-for-liveness-event';
import getKeyForLiveness from './utils/get-key-for-liveness';

export type ContentProps = {
  entity: Entity;
  livenessData: Liveness[];
};

enum OptionValue {
  businessAddress = 'businessAddress',
  residentialAddress = 'residentialAddress',
  onboarding = 'onboarding',
  auth = 'auth',
}

type Option = { label: string; value: OptionValue };

const Content = ({ entity, livenessData }: ContentProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.device-insights',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [detailsHidden, setDetailsHidden] = useState(false);

  const options: Option[] = [];
  const cards: JSX.Element[] = [];
  const allMarkers: (Marker | null)[] = [];
  if (livenessData.length) {
    const scopes: IdentifyScope[] = Array.from(
      new Set(livenessData.map(liveness => liveness.scope)),
    );
    scopes.forEach(scope => {
      if (scope === IdentifyScope.onboarding || scope === IdentifyScope.auth) {
        options.push({
          value:
            scope === IdentifyScope.onboarding
              ? OptionValue.onboarding
              : OptionValue.auth,
          label: t(`scope.${scope}`),
        });
      }
    });
  }

  const hasBusinessAddress = entity.attributes.includes(
    BusinessDI.addressLine1,
  );
  if (hasBusinessAddress) {
    options.push({
      value: OptionValue.businessAddress,
      label: t('select.business-address'),
    });
  }
  const hasResidentialAddress = entity.attributes.includes(IdDI.addressLine1);
  if (hasResidentialAddress) {
    options.push({
      value: OptionValue.residentialAddress,
      label: t('select.residential-address'),
    });
  }

  const [selectedOptionsSet, setSelectedOptionsSet] = useState<
    Set<OptionValue>
  >(new Set(options.map(e => e.value)));
  const handleOptionsChange = (newOptions: readonly Option[]) => {
    setSelectedOptionsSet(new Set(newOptions.map(e => e.value)));
  };

  if (selectedOptionsSet.has(OptionValue.onboarding)) {
    livenessData.forEach(liveness => {
      const lat = liveness.insight.latitude;
      const lng = liveness.insight.longitude;
      const hasLocation = lat !== null && lng !== null;
      const isSelected = selectedIndex === allMarkers.length;
      allMarkers.push(
        hasLocation
          ? {
              lat,
              lng,
              icon: getIconForLivenessEvent(
                liveness,
                isSelected ? 'primary' : 'quinary',
              ),
              isSelected,
            }
          : null,
      );
      cards.push(
        <InsightEventCard
          key={getKeyForLiveness(liveness)}
          liveness={liveness}
        />,
      );
    });
  }

  // TODO: add markers with getCoordinatesFromAddress
  if (selectedOptionsSet.has(OptionValue.businessAddress)) {
    cards.push(
      <AddressCard
        key="business-address"
        type={AddressType.business}
        entity={entity}
      />,
    );
  }

  if (selectedOptionsSet.has(OptionValue.residentialAddress)) {
    cards.push(
      <AddressCard
        key="residential-address"
        type={AddressType.residential}
        entity={entity}
      />,
    );
  }

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
      <Map markers={allMarkers.filter(Boolean) as Marker[]} />
    </Container>
  );
};

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
