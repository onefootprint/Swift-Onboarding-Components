import type { Entity } from '@onefootprint/types';
import { LinkButton, LoadingSpinner, Stack, Text } from '@onefootprint/ui';
import { Trans, useTranslation } from 'react-i18next';
import FieldOrPlaceholder from 'src/components/field-or-placeholder';

import { useDecryptControls } from '../../../../../vault/components/vault-actions';
import useAddressFieldsProps from '../../hooks/use-address-fields-props';
import CardBase from '../card-base';
import CardRow from '../card-row';
import AddressCardIcon from './components/address-card-icon';
import type AddressType from './types';

type AddressCardProps = {
  id: string;
  type: AddressType;
  entity: Entity;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  isLoading?: boolean;
};

const AddressCard = ({ id, type, entity, isSelected, onSelect, isLoading }: AddressCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.device-insights.address-card',
  });

  const { getAddressFieldsProps, getAddressDis } = useAddressFieldsProps(entity);

  const headerText = type === 'business' ? t('business.header-text') : t('residential.header-text');

  const rows = getAddressFieldsProps(type).map(prop => (
    <CardRow
      key={prop.label}
      label={prop.label}
      value={<FieldOrPlaceholder data={prop.value} transforms={prop.transforms} />}
    />
  ));

  const handleClick = () => {
    const dis = getAddressDis(type);
    decryptControls.submitFields(dis, []);
  };

  const decryptableSet = new Set(entity.decryptableAttributes);

  const encryptedFields = getAddressFieldsProps(type).filter(prop => !prop.isDecrypted);
  const decryptableFields = encryptedFields.filter(
    field => !field || (decryptableSet.has(field.name) && field.canDecrypt),
  );
  const decryptControls = useDecryptControls();
  const isCtaLoading = isLoading || decryptControls.isLoading;
  const isCtaVisible = decryptableFields.length > 0 || isCtaLoading;

  let ctaElem;
  if (isCtaVisible) {
    if (isCtaLoading) {
      ctaElem = <LoadingSpinner size={22} color="accent" />;
    } else {
      ctaElem = (
        <Stack width="100%" direction="column" align="flex-start" zIndex={2}>
          <Text variant="label-3">
            <Trans
              i18nKey="pages.entity.device-insights.address-card.cta.text"
              components={{
                link: <LinkButton onClick={handleClick}>{t('cta.link')}</LinkButton>,
              }}
            />
          </Text>
        </Stack>
      );
    }
  }

  return (
    <CardBase
      id={id}
      isSelected={isSelected}
      onSelect={() => onSelect?.(id)}
      headerIcon={<AddressCardIcon type={type} size="large" />}
      headerText={headerText}
      rows={rows}
      cta={ctaElem}
    />
  );
};

export default AddressCard;
