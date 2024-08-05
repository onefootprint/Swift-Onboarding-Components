import { IcoBroadcast24 } from '@onefootprint/icons';
import type { BusinessAddress } from '@onefootprint/types';
import { Badge, Box, Stack, Text } from '@onefootprint/ui';
import capitalize from 'lodash/capitalize';
import isNull from 'lodash/isNull';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { GOOGLE_MAPS_API_KEY } from 'src/config/constants';
import type { DefaultTheme } from 'styled-components';
import styled, { css } from 'styled-components';

const IMAGE_WIDTH = 396;
const IMAGE_HEIGHT = 196;

type AddressCardProps = {
  address: BusinessAddress;
  isSelected: boolean;
  onSelect: (address: BusinessAddress) => void;
};

const AddressCard = ({ address, isSelected, onSelect }: AddressCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights',
  });
  const {
    id,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    latitude,
    longitude,
    propertyType,
    submitted,
    deliverable,
    verified,
  } = address;
  const showNotes = !isNull(propertyType) || !isNull(deliverable);

  const handleSelect = () => {
    const card = document.getElementById(`offices-card-${id}`);
    const parent = card?.parentElement;
    if (card && parent) {
      parent.scrollTo({
        top: card.offsetTop,
        behavior: 'smooth',
      });
    }
    onSelect(address);
  };

  const getSatelliteImageSrc = (latitude: number, longitude: number) => {
    const buildingZoom = 19;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${buildingZoom}&size=${IMAGE_WIDTH}x${IMAGE_HEIGHT}&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
  };

  const formatAddressLine = (addressFields: (string | null)[]) => {
    return addressFields.filter(field => !!field).join(', ');
  };

  const getUspsText = (text: string) => {
    return (
      <Text variant="body-3">
        {t('offices.usps')} &middot; {text}
      </Text>
    );
  };

  return (
    <Container id={`offices-card-${id}`} data-selected={!!isSelected} onClick={handleSelect}>
      <CardBanner>
        {latitude && longitude ? (
          <img aria-label="satellite map" src={getSatelliteImageSrc(latitude, longitude)} />
        ) : (
          <EmptyState>
            <IcoBroadcast24 color="quaternary" />
            <Text variant="label-2" color="quaternary">
              No satellite image available
            </Text>
          </EmptyState>
        )}
        <BadgeContainer gap={2} align="center">
          {!isNull(submitted) && (
            <Badge variant="neutral">{submitted ? t('tags.submitted') : t('tags.not-submitted')}</Badge>
          )}
          {!isNull(verified) && (
            <Badge variant={verified ? 'success' : 'error'}>
              {verified ? t('tags.verified') : t('tags.not-verified')}
            </Badge>
          )}
        </BadgeContainer>
      </CardBanner>
      <Stack padding={5} direction="column" gap={6}>
        <Stack direction="column" gap={3}>
          <Text variant="label-1">{formatAddressLine([addressLine1, addressLine2])}</Text>
          <Text variant="body-2">{formatAddressLine([city, state, postalCode])}</Text>
        </Stack>
        {showNotes && (
          <Stack direction="column" gap={3}>
            <Text variant="label-3">{t('offices.notes')}</Text>
            {!isNull(propertyType) && getUspsText(capitalize(propertyType))}
            {!isNull(deliverable) && getUspsText(deliverable ? t('offices.deliverable') : t('offices.not-deliverable'))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

const getActiveStyle = (theme: DefaultTheme) => css`
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${theme.backgroundColor.accent};
  opacity: 0.1;
`;

const Container = styled.div`
  ${({ theme }) => css`
    position: relative;
    width: ${IMAGE_WIDTH}px;
    display: flex;
    flex-direction: column;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    cursor: pointer;

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }

    &[data-selected='true'] {
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.secondary};

      &::after {
        ${getActiveStyle(theme)}
      }
    }
  `};
`;

const CardBanner = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default} ${theme.borderRadius.none} ${theme.borderRadius.none};
    overflow: hidden;
  `};
`;

const BadgeContainer = styled(Stack)`
  ${({ theme }) => css`
    position: absolute;
    top: 0;
    left: 0;
    padding: ${theme.spacing[4]};
    z-index: ${theme.zIndex.sticky};
  `}
`;

const EmptyState = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[5]};
    background-color: ${theme.backgroundColor.primary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    min-height: ${IMAGE_HEIGHT}px;
  `}
`;

export default AddressCard;
