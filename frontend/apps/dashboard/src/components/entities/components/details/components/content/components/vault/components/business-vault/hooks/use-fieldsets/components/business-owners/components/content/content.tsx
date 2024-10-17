import type { BusinessOwner } from '@onefootprint/types';
import { Badge, Box, Grid, Stack, Text } from '@onefootprint/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FieldOrPlaceholder } from 'src/components';
import StatusBadge from 'src/components/status-badge';

export type ContentProps = {
  businessOwners: BusinessOwner[];
};

const BusinessOwnersField = ({ businessOwners }: ContentProps) => {
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
    <Box testID="business-owners-content">
      <Grid.Container gap={4}>
        {businessOwners.map((businessOwner, index) => (
          <Stack
            alignItems="center"
            aria-label={allT('di.business.kyced_beneficial_owners')}
            justifyContent="space-between"
            key={businessOwner.fpId || index}
          >
            <Stack direction="column" gap={2}>
              <Stack align="center" gap={2}>
                <Text variant="body-3" color="tertiary">
                  {allT('di.business.kyced_beneficial_owners')}
                </Text>
                {businessOwner.status ? (
                  <StatusBadge status={businessOwner.status} />
                ) : (
                  <Badge variant="warning">{t('status.awaiting-kyc')}</Badge>
                )}
                {businessOwner.fpId && (
                  <>
                    <span>·</span>
                    <Text color="accent" variant="label-3">
                      <Link target="_blank" href={`/users/${businessOwner.fpId}`}>
                        {t('link')}
                      </Link>
                    </Text>
                  </>
                )}
              </Stack>
              <Text variant="caption-2" color="secondary">
                {getHintText(businessOwner)}
              </Text>
            </Stack>
            <FieldOrPlaceholder data={businessOwner.name} />
          </Stack>
        ))}
      </Grid.Container>
    </Box>
  );
};

export default BusinessOwnersField;
