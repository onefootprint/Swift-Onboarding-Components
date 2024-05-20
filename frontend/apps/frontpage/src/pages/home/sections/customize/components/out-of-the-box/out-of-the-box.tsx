import { LinkButton, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type OutOfTheBoxProps = {
  onClick: () => void;
};

const OutOfTheBox = ({ onClick }: OutOfTheBoxProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.customize.components.out-of-the-box',
  });
  return (
    <Text
      variant="label-2"
      color="primary"
      display="inline-flex"
      flexWrap="wrap"
      gap={2}
      alignItems="center"
      justifyContent="center"
    >
      {t('first-part')}
      <LinkButton onClick={onClick}>{t('cta')}</LinkButton>
      {t('second-part')}
    </Text>
  );
};

export default OutOfTheBox;
