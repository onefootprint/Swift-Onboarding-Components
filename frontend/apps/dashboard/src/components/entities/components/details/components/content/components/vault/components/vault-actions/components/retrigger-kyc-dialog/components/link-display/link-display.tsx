import { Stack, TextInput, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type LinkDisplayProps = {
  link: string;
};

const LinkDisplay = ({ link }: LinkDisplayProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.retrigger-kyc',
  });

  return (
    <Stack gap={3} direction="column">
      <Typography variant="label-3">{t('link.header')}</Typography>
      <Typography variant="body-3" color="secondary">
        {t('link.share-this-link')}
      </Typography>
      <TextInput
        placeholder="https://verify.onefootprint.com#tok_okj3nppo1zyj6d7uJ9l49iLxY1uc2N4riz"
        value={link}
        size="compact"
        disabled
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      />
    </Stack>
  );
};

export default LinkDisplay;
