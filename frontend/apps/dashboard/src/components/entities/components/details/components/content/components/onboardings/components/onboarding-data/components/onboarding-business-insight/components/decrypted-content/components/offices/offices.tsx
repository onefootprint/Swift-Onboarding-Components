import { IcoForbid40 } from '@onefootprint/icons';
import { ScrollArea } from '@onefootprint/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Subsection from '../../../../../subsection';
import type { FormattedAddress } from '../../../../onboarding-business-insight.types';
import AddressCard from './components/address-card';
import MapComponent from './components/map';
import MapMarker from './components/map/components/map-marker';
import useAddressCoordinates from './hooks/use-address-coordinates';

export type OfficesProps = {
  data: FormattedAddress[];
};

const Content = ({ data }: OfficesProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.offices' });

  const dataWithCoordinates = data.map(address => {
    const { data: coordinates } = useAddressCoordinates(address);
    return {
      ...address,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
    } as FormattedAddress;
  });

  const firstWithCoordinates = dataWithCoordinates.find(address => address.latitude && address.longitude);

  const [selectedAddress, setSelectedAddress] = useState<FormattedAddress | undefined>(firstWithCoordinates);

  useEffect(() => {
    if (!selectedAddress && firstWithCoordinates) {
      setSelectedAddress(firstWithCoordinates);
    }
  }, [firstWithCoordinates, selectedAddress]);

  const handleSelectFromMap = (address: FormattedAddress) => {
    setSelectedAddress(address);
    const card = document.getElementById(`offices-card-${address.id}`);
    if (card?.parentElement) {
      card.parentElement.scrollTo({
        top: card.offsetTop,
        behavior: 'smooth',
      });
    }
  };

  const renderCards = () => {
    if (dataWithCoordinates.length === 0) {
      return (
        <div key="empty" className="flex flex-col items-center justify-center w-full h-full gap-5 flex-grow-1">
          <IcoForbid40 />
          <p className="text-label-2">{t('empty')}</p>
        </div>
      );
    }

    return dataWithCoordinates.map(address => {
      const isSelected = selectedAddress?.id === address.id;

      return <AddressCard key={address.id} address={address} isSelected={isSelected} onSelect={setSelectedAddress} />;
    });
  };

  const renderMarkers = () => {
    return dataWithCoordinates
      .filter(address => address.latitude && address.longitude)
      .map(address => {
        const isSelected = selectedAddress?.id === address.id;

        return (
          <MapMarker
            key={address.id}
            id={address.id}
            onClick={() => handleSelectFromMap(address)}
            latitude={address.latitude as number}
            longitude={address.longitude as number}
            isSelected={isSelected}
          />
        );
      });
  };

  return (
    <Subsection title={t('title')} className="h-full overflow-y-hidden">
      <div className="relative w-full h-full grid grid-cols-[1fr_2fr] gap-3 overflow-y-hidden">
        <ScrollArea>
          <div className="box-content relative flex flex-col h-full max-w-full gap-3 px-1 py-1">{renderCards()}</div>
        </ScrollArea>
        <div className="box-content relative overflow-hidden rounded">
          <MapComponent
            markers={renderMarkers()}
            selectedAddress={selectedAddress}
            onSelect={id =>
              handleSelectFromMap(dataWithCoordinates.find(address => address.id === id) as FormattedAddress)
            }
          />
        </div>
      </div>
    </Subsection>
  );
};

export default Content;
