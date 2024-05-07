import type { BusinessDI, Entity, IdDI } from '@onefootprint/types';
import { AnimatedLoadingSpinner, LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import FieldValue from '../../../../../vault/components/field/components/field-value';
import { useDecryptControls } from '../../../../../vault/components/vault-actions';
import useField from '../../../../../vault/hooks/use-field';
import CardBase from '../card-base';
import CardRow from '../card-row';
import AddressCardIcon from './components/address-card-icon';
import { type AddressType, attributesByType } from './types';

type AddressCardProps = {
  type: AddressType;
  entity: Entity;
  isSelected?: boolean;
  onSelect?: () => void;
};

const AddressCard = ({
  type,
  entity,
  isSelected,
  onSelect,
}: AddressCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.device-insights.address-card',
  });
  const getProps = useField(entity);
  const dis = attributesByType[type].filter(di =>
    entity.decryptableAttributes.includes(di),
  );
  const disSet = new Set(dis);
  const filteredAttributes = entity.data
    .filter(attr => disSet.has(attr.identifier as IdDI | BusinessDI))
    .map(attr => attr.identifier) as (IdDI | BusinessDI)[];
  const sortedAttributes = filteredAttributes.sort(
    (a, b) => dis.indexOf(a) - dis.indexOf(b),
  );
  const attributesProps = sortedAttributes.map(getProps);
  const rows: JSX.Element[] = attributesProps.map(prop => (
    <CardRow
      key={prop.label}
      label={prop.label}
      value={<FieldValue field={prop} />}
    />
  ));

  let cta;
  const decryptControls = useDecryptControls();
  const shouldDecrypt = attributesProps.some(prop => !prop.isDecrypted);
  const canDecrypt = shouldDecrypt && !!entity.decryptableAttributes.length;
  if (canDecrypt) {
    if (decryptControls.isLoading) {
      cta = <AnimatedLoadingSpinner animationStart size={22} color="accent" />;
    } else {
      cta = (
        <LinkButton
          onClick={() => {
            decryptControls.submitAllFields(dis);
          }}
        >
          {t('cta')}
        </LinkButton>
      );
    }
  }

  return (
    <CardBase
      isSelected={isSelected}
      onSelect={onSelect}
      headerIcon={<AddressCardIcon type={type} />}
      headerText={
        type === 'business'
          ? t('business.header-text')
          : t('residential.header-text')
      }
      rows={rows}
      cta={cta}
    />
  );
};

export default AddressCard;
