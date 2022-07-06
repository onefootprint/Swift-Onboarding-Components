import { useTranslation } from 'hooks';
import React from 'react';
import { LinkButton } from 'ui';

// TODO:
// https://linear.app/footprint/issue/FP-519/decrypt-ssn
const ToggleSSN = () => {
  const { t } = useTranslation('pages.my-footprint-identity.identity.ssn');
  const isSSNDecrypted = false;

  const handleToggleSSN = () => {
    alert('to be implemented');
  };

  return (
    <LinkButton onClick={handleToggleSSN} size="compact">
      {isSSNDecrypted ? t('toggle.hide') : t('toggle.show')}
    </LinkButton>
  );
};

export default ToggleSSN;
