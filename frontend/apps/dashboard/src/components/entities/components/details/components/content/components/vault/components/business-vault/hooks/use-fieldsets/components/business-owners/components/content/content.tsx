import { IcoInfo16 } from '@onefootprint/icons';
import type { BusinessOwner } from '@onefootprint/types';
import { Badge, Grid, Stack, Text } from '@onefootprint/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import StatusBadge from 'src/components/status-badge';

export type ContentProps = {
  businessOwners: BusinessOwner[];
  explanationMessage?: string;
};

const BusinessOwnersField = ({ businessOwners, explanationMessage }: ContentProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('business-details', { keyPrefix: 'vault.bos' });

  const getHintText = ({ ownershipStake: stake, kind, source }: BusinessOwner): string => {
    const isPrimary = kind === 'primary' && source !== 'tenant';
    if (isPrimary) {
      return stake ? t('hint.primary-with-stake', { stake }) : t('hint.primary-no-stake');
    }
    return stake ? t('hint.generic-stake', { stake }) : '';
  };

  return (
    <Stack gap={7} direction="column">
      <Grid.Container gap={4} tag="ul" aria-label={t('list-title')}>
        {businessOwners.map((businessOwner, index) => (
          <Stack justifyContent="space-between" key={businessOwner.fpId || index} tag="li">
            <Stack direction="column" gap={2}>
              <Stack align="center" gap={2}>
                <Text variant="body-3" color="tertiary">
                  {allT('di.business.kyced_beneficial_owners')}
                </Text>
                {businessOwner.status ? (
                  <StatusBadge status={businessOwner.status} />
                ) : (
                  <Badge variant="info">{t('status.awaiting-kyc')}</Badge>
                )}
                {businessOwner.fpId && <ViewProfileLink href={`/users/${businessOwner.fpId}`} />}
              </Stack>
              <Text variant="caption-2" color="secondary">
                {getHintText(businessOwner)}
              </Text>
            </Stack>
            <Text variant="body-3" color="primary" center height="24px">
              {businessOwner.name}
            </Text>
          </Stack>
        ))}
      </Grid.Container>
      {explanationMessage ? <OwnershipExplanation value={explanationMessage} /> : null}
    </Stack>
  );
};

const ViewProfileLink = ({ href }: { href: string }) => {
  const { t } = useTranslation('business-details', { keyPrefix: 'vault.bos' });

  return (
    <>
      <span>·</span>
      <Text color="accent" variant="label-3">
        <Link href={href}>{t('link')}</Link>
      </Text>
    </>
  );
};

const OwnershipExplanation = ({ value }: { value: string }) => {
  const { t } = useTranslation('business-details', { keyPrefix: 'vault.bos.stake-explanation' });

  return (
    <Stack
      backgroundColor="primary"
      borderColor="tertiary"
      borderRadius="default"
      borderStyle="solid"
      borderWidth={1}
      direction="column"
      gap={3}
      padding={5}
    >
      <Stack gap={2} alignItems="center">
        <IcoInfo16 />
        <Text variant="label-3">{t('title')}</Text>
      </Stack>
      <Text variant="body-3" color="secondary">
        {value}
      </Text>
    </Stack>
  );
};

export default BusinessOwnersField;
