import { IcoForbid40 } from '@onefootprint/icons';
import { cx } from 'class-variance-authority';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Subsection from '../../../../../subsection';
import type { FormattedAddress } from '../../../../onboarding-business-insight.types';
import AddressCard from './components/address-card';
import ContainerWithToggle from './components/container-with-toggle';
import MapComponent from './components/map';
import MapMarker from './components/map/components/map-marker';
import useAddressCoordinates from './hooks/use-address-coordinates';

export type OfficesProps = {
  data: FormattedAddress[];
};

const Content = ({ data }: OfficesProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.offices' });
  const [detailsHidden, setDetailsHidden] = useState(false);
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
    if (firstWithCoordinates && !selectedAddress) {
      setSelectedAddress(firstWithCoordinates);
    }
  }, [firstWithCoordinates]);

  const cards: JSX.Element[] = [];
  const markers: JSX.Element[] = [];
  dataWithCoordinates.forEach(address => {
    const isSelected = selectedAddress?.id === address.id;
    const hasCoordinates = Boolean(address.latitude) && Boolean(address.longitude);
    cards.push(
      <AddressCard key={address.id} address={address} isSelected={isSelected} onSelect={setSelectedAddress} />,
    );
    if (hasCoordinates) {
      markers.push(
        <MapMarker
          key={address.id}
          id={address.id}
          onClick={() => handleSelectFromMap(address)}
          latitude={address.latitude as number}
          longitude={address.longitude as number}
          isSelected={isSelected}
        />,
      );
    }
  });

  if (cards.length === 0) {
    cards.push(
      <div key="empty" className="flex flex-col gap-5 justify-center items-center flex-grow-1 w-full h-full">
        <IcoForbid40 />
        <p className="text-label-2">{t('empty')}</p>
      </div>,
    );
  }

  const handleSelectFromMap = (address: FormattedAddress) => {
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
    <Subsection title={t('title')}>
      <div className="relative h-full w-full rounded overflow-hidden border border-solid border-tertiary">
        <ContainerWithToggle isHidden={detailsHidden} onChangeHidden={setDetailsHidden}>
          <div className="relative flex flex-col gap-3 h-full w-full overflow-y-scroll box-content pb-3 pr-3">
            {cards}
          </div>
        </ContainerWithToggle>
        <div
          className={cx(
            'w-full h-full rounded overflow-hidden relative border border-solid border-tertiary transition-transform duration-300 ease-in-out translate-x-0',
            {
              'translate-x-[214px]': !detailsHidden,
            },
          )}
        >
          <MapComponent
            markers={markers}
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
