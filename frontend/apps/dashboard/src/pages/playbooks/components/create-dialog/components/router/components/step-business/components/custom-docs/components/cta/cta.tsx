import { IcoPencil16, IcoPlusSmall16 } from '@onefootprint/icons';
import { LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type CtaProps = {
  onClick: () => void;
  hasAdded: boolean;
};

const Cta = ({ onClick, hasAdded }: CtaProps) => {
  const { t } = useTranslation('common');

  return hasAdded ? (
    <LinkButton iconComponent={IcoPencil16} iconPosition="left" onClick={onClick} variant="label-4">
      {t('edit')}
    </LinkButton>
  ) : (
    <LinkButton iconComponent={IcoPlusSmall16} iconPosition="left" onClick={onClick} variant="label-4">
      {t('add')}
    </LinkButton>
  );
};

export default Cta;
