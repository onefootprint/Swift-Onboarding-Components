import { IcoPinMarker24 } from '@onefootprint/icons';
import { IdDI } from '@onefootprint/types';
import { Box, Dialog, LoadingSpinner, Stack, Text } from '@onefootprint/ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import useInitializeStreetView from './utils/use-initialize-street-view';
import useStreetViewPanorama from './utils/use-street-view-panorama';

type StreetViewDialogProps = {
  onClose: () => void;
  open: boolean;
  addressValues: Partial<Record<IdDI, string>>;
};

const StreetViewDialog = ({ onClose, open, addressValues }: StreetViewDialogProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset.address.street-view',
  });
  const streetViewRef = useRef<HTMLDivElement>(null);

  const addressLine1 = addressValues[IdDI.addressLine1] || '';
  const addressLine2 = addressValues[IdDI.addressLine2] || '';
  const city = addressValues[IdDI.city] || '';
  const state = addressValues[IdDI.state] || '';
  const zip = addressValues[IdDI.zip] || '';

  const address = `${addressLine1}${addressLine2 ? ` ${addressLine2}` : ''} ${city} ${state} ${zip}`;

  const { isSuccess, data: coordinates } = useInitializeStreetView(address, { enabled: open });
  const { isFetching } = useStreetViewPanorama(coordinates, streetViewRef, open);

  return (
    <Dialog open={open} onClose={onClose} title={t('title')} size="full-screen" noPadding>
      {isFetching && (
        <Stack
          position="absolute"
          top={0}
          left="50%"
          right={0}
          bottom={0}
          justifyContent="center"
          alignItems="center"
          zIndex={1000}
        >
          <LoadingSpinner />
        </Stack>
      )}
      <Box position="relative" height="100%">
        <StreetViewContainer ref={streetViewRef} isFetching={isFetching} />
        {isSuccess && (
          <Stack
            position="absolute"
            backgroundColor="primary"
            borderRadius="default"
            paddingBlock={3}
            paddingLeft={3}
            paddingRight={4}
            transform="translate(-50%, 0%)"
            left="50%"
            bottom="24px"
            zIndex={1000}
            gap={3}
            alignItems="center"
          >
            <IcoPinMarker24 />
            <Stack direction="column" gap={0}>
              <Text variant="label-3">
                {addressLine1} {addressLine2 ? `${addressLine2}` : ''}
              </Text>
              <Text variant="body-3" color="tertiary">
                {city}, {state} {zip}
              </Text>
            </Stack>
          </Stack>
        )}
      </Box>
    </Dialog>
  );
};

const StreetViewContainer = styled.div<{ isFetching: boolean }>`
  ${({ theme, isFetching }) => `
    display: ${isFetching ? 'none' : 'block'};
    overflow: hidden;
    width: calc(100vw - ${theme.spacing[7]} * 2);
    height: calc(100vh - 44px - ${theme.spacing[7]} * 2);
    border-bottom-left-radius: ${theme.borderRadius.default};
    border-bottom-right-radius: ${theme.borderRadius.default};
  `}
`;

export default StreetViewDialog;
