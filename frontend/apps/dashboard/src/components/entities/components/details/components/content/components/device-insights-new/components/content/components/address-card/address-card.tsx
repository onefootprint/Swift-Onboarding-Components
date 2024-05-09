import type { Entity } from '@onefootprint/types';
import { AnimatedLoadingSpinner, LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import FieldValue from '../../../../../vault/components/field/components/field-value';
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

const AddressCard = ({
  id,
  type,
  entity,
  isSelected,
  onSelect,
  isLoading,
}: AddressCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.device-insights.address-card',
  });

  const { getAddressFieldsProps, getAddressDis } =
    useAddressFieldsProps(entity);

  const headerText =
    type === 'business'
      ? t('business.header-text')
      : t('residential.header-text');

  const rows = getAddressFieldsProps(type).map(prop => (
    <CardRow
      key={prop.label}
      label={prop.label}
      value={<FieldValue field={prop} />}
    />
  ));

  const handleClick = () => {
    const dis = getAddressDis(type);
    decryptControls.submitAllFields(dis);
  };

  const decryptableSet = new Set(entity.decryptableAttributes);

  const encryptedFields = getAddressFieldsProps(type).filter(
    prop => !prop.isDecrypted,
  );
  const canDecryptFields =
    encryptedFields.length > 0
      ? encryptedFields.every(
          field => decryptableSet.has(field.name) && field.canDecrypt,
        )
      : false;
  const decryptControls = useDecryptControls();
  const isCtaLoading = isLoading || decryptControls.isLoading;
  const isCtaVisible = canDecryptFields || isCtaLoading;

  let ctaElem;
  if (isCtaVisible) {
    if (isCtaLoading) {
      ctaElem = (
        <AnimatedLoadingSpinner animationStart size={22} color="accent" />
      );
    } else {
      ctaElem = <LinkButton onClick={handleClick}>{t('cta')}</LinkButton>;
    }
  }

  return (
    <CardBase
      id={id}
      isSelected={isSelected}
      onSelect={() => onSelect?.(id)}
      headerIcon={<AddressCardIcon type={type} />}
      headerText={headerText}
      rows={rows}
      cta={ctaElem}
    />
  );
};

export default AddressCard;
