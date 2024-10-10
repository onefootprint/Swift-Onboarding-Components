import { Box, Dialog } from '@onefootprint/ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import GoogleMapsLoader from 'src/components/entities/utils/google-maps-loader';
import styled from 'styled-components';
import useInitializeStreetView from './utils/use-initialize-street-view';

type StreetViewDialogProps = {
  onClose: () => void;
  open: boolean;
};

const StreetViewDialog = ({ onClose, open }: StreetViewDialogProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset.address.street-view',
  });
  const streetViewRef = useRef<HTMLDivElement>(null);
  const address = '521 Ivy Street, San Francisco, CA 94102';

  const { isSuccess, data: coordinates } = useInitializeStreetView(address);

  const displayStreetView = async ({ coordinates }: { coordinates: { latitude: number; longitude: number } }) => {
    await GoogleMapsLoader.importLibrary('core');
    new google.maps.StreetViewPanorama(streetViewRef.current as HTMLElement, {
      position: { lat: coordinates.latitude, lng: coordinates.longitude },
      pov: { heading: 165, pitch: 0 },
      zoom: 1,
      disableDefaultUI: true,
    });
  };

  useEffect(() => {
    if (isSuccess && streetViewRef.current) {
      displayStreetView({ coordinates });
    }
  }, [isSuccess, coordinates]);

  return (
    <Dialog open={open} onClose={onClose} title={t('title')} size="full-screen" noPadding>
      <Box position="relative" height="100%">
        <StreetViewContainer ref={streetViewRef} />
      </Box>
    </Dialog>
  );
};

const StreetViewContainer = styled.div`
  ${({ theme }) => `
    overflow: hidden;
    width: calc(100vw - ${theme.spacing[7]} * 2);
    height: calc(100vh - 44px - ${theme.spacing[7]} * 2);
    border-bottom-left-radius: ${theme.borderRadius.default};
    border-bottom-right-radius: ${theme.borderRadius.default};
  `}
`;

export default StreetViewDialog;
