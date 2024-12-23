import { IcoBroadcast24 } from '@onefootprint/icons';
import { Badge } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import capitalize from 'lodash/capitalize';
import isUndefined from 'lodash/isUndefined';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GOOGLE_MAPS_API_KEY } from 'src/config/constants';
import type { FormattedAddress } from '../../../../../../onboarding-business-insight.types';

const IMAGE_WIDTH = 277;
const IMAGE_HEIGHT = 150;
const BUILDING_ZOOM = 19;

type AddressCardProps = {
  address: FormattedAddress;
  isSelected: boolean;
  onSelect: (address: FormattedAddress) => void;
};

const AddressCard = ({ address, isSelected, onSelect }: AddressCardProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings' });
  const [satelliteImageError, setSatelliteImageError] = useState(false);
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
  const showNotes = !propertyType || !isUndefined(deliverable);
  const satelliteImageSrc = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${BUILDING_ZOOM}&size=${IMAGE_WIDTH}x${IMAGE_HEIGHT}&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;

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

  const handleSatelliteImageError = () => {
    setSatelliteImageError(true);
  };

  const formatAddressLine = (addressFields: (string | undefined)[]) =>
    addressFields.filter(field => Boolean(field)).join(', ');

  const getUspsText = (text: string) => (
    <p className="text-body-3">
      {t('offices.usps')} &middot; {text}
    </p>
  );

  return (
    <button
      id={`offices-card-${id}`}
      className={cx(
        'w-fit relative flex flex-col border border-solid border-tertiary rounded bg-primary cursor-pointer',
        {
          'border-secondary after:absolute after:inset-0 after:bg-accent after:opacity-10 after:rounded': isSelected,
          'hover:bg-secondary': !isSelected,
        },
      )}
      onClick={handleSelect}
      type="button"
    >
      <div className="w-full overflow-hidden rounded-t">
        {latitude && longitude && !satelliteImageError ? (
          <img aria-label="satellite map" src={satelliteImageSrc} onError={handleSatelliteImageError} />
        ) : (
          <div
            style={{ height: `${IMAGE_HEIGHT}px` }}
            className={
              'flex flex-col items-center justify-center gap-1 bg-inherit border-b border-solid border-tertiary'
            }
          >
            <IcoBroadcast24 color="quaternary" />
            <p className="text-label-2 text-quaternary">{t('offices.no-satellite-image')}</p>
          </div>
        )}
        <div className="absolute top-0 left-0 flex gap-1 items-center p-3 z-sticky">
          {!isUndefined(submitted) && (
            <Badge variant="neutral">
              {submitted ? t('business-shared.tags.submitted') : t('business-shared.tags.not-submitted')}
            </Badge>
          )}
          {!isUndefined(verified) && (
            <Badge variant={verified ? 'success' : 'error'}>
              {verified ? t('business-shared.tags.verified') : t('business-shared.tags.not-verified')}
            </Badge>
          )}
        </div>
      </div>
      <div className="w-full flex flex-col gap-5 p-4 text-left">
        <div className="flex flex-col gap-2">
          <p className="text-label-1">{formatAddressLine([addressLine1, addressLine2])}</p>
          <p className="text-body-2">{formatAddressLine([city, state, postalCode])}</p>
        </div>
        {showNotes && (
          <div className="flex flex-col gap-2">
            <p className="text-label-3">{t('offices.notes')}</p>
            {!isUndefined(propertyType) && getUspsText(capitalize(propertyType))}
            {!isUndefined(deliverable) &&
              getUspsText(deliverable ? t('offices.deliverable') : t('offices.not-deliverable'))}
          </div>
        )}
      </div>
    </button>
  );
};

export default AddressCard;
