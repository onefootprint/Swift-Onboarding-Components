'use client';

import { IcoLink24 } from '@onefootprint/icons';
import { Button, IconButton, Stack, Text } from '@onefootprint/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

type ExternalLinkProps = { url: string };

const extractCleanDomain = (s: string): string => s.replace(/(https?:\/\/)?(www\.)?/gi, '').split('/')[0];

const ExternalLink = ({ url }: ExternalLinkProps) => {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useTranslation('common');

  const path = params.get('path');
  const onCloseClick = path ? () => router.push(path) : () => router.back();

  return (
    <Stack alignItems="center" flexDirection="column" justifyContent="center" flexBasis="100%" gap={5}>
      <IconButton aria-label="close" onClick={onCloseClick}>
        <IcoLink24 />
      </IconButton>
      <Text variant="label-3">{t('external-link')}</Text>
      <Stack display="inline" maxWidth="440px" textAlign="center">
        <Text tag="span" variant="body-3">
          {t('doc.hosted-on')}&nbsp;
        </Text>
        <Text tag="span" variant="label-3" color="primary">
          {extractCleanDomain(url)}.&nbsp;
        </Text>
        <Text tag="span" variant="body-3">
          {t('doc.visit-and-review')}
        </Text>
      </Stack>
      <Stack alignItems="center" justifyContent="space-between" gap={3}>
        <Button variant="secondary" onClick={() => (url ? window.open(url, '_blank') : undefined)}>
          {t('open-link')}
        </Button>
      </Stack>
    </Stack>
  );
};

export default ExternalLink;
