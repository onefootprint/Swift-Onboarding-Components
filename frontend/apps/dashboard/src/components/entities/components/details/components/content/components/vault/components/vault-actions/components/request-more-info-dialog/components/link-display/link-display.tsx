import { IcoClock16 } from '@onefootprint/icons';
import type { TriggerResponse } from '@onefootprint/types';
import { Shimmer, Stack, Text, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type LinkDisplayProps = {
  linkData?: Omit<TriggerResponse, 'kind'>;
};

const LinkDisplay = ({ linkData }: LinkDisplayProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.request-more-info',
  });

  const expiresAt = linkData?.expiresAt ? new Date(linkData.expiresAt) : new Date();
  const expiresInMs = expiresAt.getTime() - new Date().getTime();
  const expiresInDays = Math.round(expiresInMs / (1000 * 3600 * 24));

  return (
    <Stack gap={3} direction="column">
      <Text variant="label-3">{linkData ? t('link.header-generated') : t('link.header-generating')}</Text>
      <Text variant="body-3" color="secondary">
        {t('link.share-this-link')}
      </Text>

      {linkData ? (
        <>
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
        </>
      ) : (
        <>
          <Shimmer width="100%" height="32px" />
          <Shimmer width="50%" height="16px" />
        </>
      )}
    </Stack>
  );
};

export default LinkDisplay;
