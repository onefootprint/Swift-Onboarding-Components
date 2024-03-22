import { IcoClock16 } from '@onefootprint/icons';
import type { TriggerResponse } from '@onefootprint/types';
import { Stack, Text, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type LinkDisplayProps = {
  linkData: TriggerResponse;
};

const LinkDisplay = ({ linkData }: LinkDisplayProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.retrigger-kyc',
  });

  const expiresInMs =
    new Date(linkData.expiresAt).getTime() - new Date().getTime();
  const expiresInDays = Math.round(expiresInMs / (1000 * 3600 * 24));

  return (
    <Stack gap={3} direction="column">
      <Text variant="label-3">{t('link.header')}</Text>
      <Text variant="body-3" color="secondary">
        {t('link.share-this-link')}
      </Text>
      <TextInput
        placeholder="https://verify.onefootprint.com#tok_okj3nppo1zyj6d7uJ9l49iLxY1uc2N4riz"
        value={linkData.link}
        size="compact"
        disabled
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      />
      <Stack gap={2}>
        <IcoClock16 color="quaternary" />
        <Text color="quaternary" variant="caption-4">
          {t('link.expires-in', { numDays: expiresInDays })}
        </Text>
      </Stack>
    </Stack>
  );
};

export default LinkDisplay;
