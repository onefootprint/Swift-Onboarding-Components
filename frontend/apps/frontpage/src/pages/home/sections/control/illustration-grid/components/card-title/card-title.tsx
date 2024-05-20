import { IcoPencil16, IcoPlusSmall16 } from '@onefootprint/icons';
import { LinkButton, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type CardTitleProps = {
  children: string;
  type?: 'edit' | 'add';
  onClick?: () => void;
};

const CardTitle = ({ children, type = 'edit', onClick }: CardTitleProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.control.illustration',
  });
  return (
    <Stack direction="row" justify="space-between">
      <Text variant="label-3">{children}</Text>
      <LinkButton
        variant="label-3"
        iconPosition="left"
        iconComponent={type === 'add' ? IcoPlusSmall16 : IcoPencil16}
        onClick={onClick}
      >
        {type === 'add' ? t('add') : t('edit')}
      </LinkButton>
    </Stack>
  );
};

export default CardTitle;
