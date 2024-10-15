import type { BusinessOwner } from '@onefootprint/types';
import { Box, Grid, Stack, Text } from '@onefootprint/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FieldOrPlaceholder } from 'src/components';
import StatusBadge from 'src/components/status-badge';
import styled from 'styled-components';

export type ContentProps = {
  businessOwners: BusinessOwner[];
};

const BusinessOwnersField = ({ businessOwners }: ContentProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.business.vault.bos',
  });
  const label = allT('di.business.kyced_beneficial_owners');

  const boHintText = ({ ownershipStake: stake, kind, source }: BusinessOwner): string => {
    const isPrimary = kind === 'primary' && source !== 'tenant';
    if (isPrimary) {
      return stake ? t('hint.primary_with_stake', { stake }) : t('hint.primary_no_stake');
    }
    return stake ? t('hint.generic_stake', { stake }) : '';
  };

  return (
    <Box testID="business-owners-content">
      <Grid.Container gap={4}>
        {businessOwners.map((businessOwner, index) => (
          <FieldContainer key={businessOwner.id || index} aria-label={label}>
            <Stack direction="column" gap={2}>
              <Stack align="center" gap={2}>
                <Text variant="body-3" color="tertiary">
                  {label}
                </Text>
                {businessOwner.status && <StatusBadge status={businessOwner.status} />}
                {businessOwner.id && (
                  <>
                    <span>·</span>
                    <Text color="accent" variant="label-3">
                      <Link target="_blank" href={`/users/${businessOwner.id}`}>
                        {t('link')}
                      </Link>
                    </Text>
                  </>
                )}
              </Stack>
              <Text variant="caption-2" color="secondary">
                {boHintText(businessOwner)}
              </Text>
            </Stack>
            <FieldOrPlaceholder data={businessOwner.name} />
          </FieldContainer>
        ))}
      </Grid.Container>
    </Box>
  );
};

const FieldContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export default BusinessOwnersField;
