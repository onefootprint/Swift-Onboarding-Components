import { IcoArrowRightSmall16, IcoCopy16 } from '@onefootprint/icons';
import type { AmlHit, AmlHitMedia } from '@onefootprint/request-types/dashboard';
import { Box, CopyButton, LinkButton, Stack, Text, useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import HitItem from './components/hit-item';
import HitsShimmer from './components/hits-shimmer';
import ProtectedDetails from './components/protected-details';
import useCachedRiskSignalAmlHint from './hooks/use-cached-risk-signal-aml-hint';
import useRiskSignalAmlHits from './hooks/use-risk-signal-aml-hits';

type MatchesProps = {
  riskSignalId: string;
  handleShowAmlMedia: (media: AmlHitMedia[]) => void;
};

const Matches = ({ riskSignalId, handleShowAmlMedia }: MatchesProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings.risk-signals.drawer',
  });
  const entityId = useEntityId();
  const cachedAmlHit = useCachedRiskSignalAmlHint(riskSignalId);
  const decryptMutation = useRiskSignalAmlHits();
  const aml = decryptMutation.data || cachedAmlHit;
  const toast = useToast();

  const handleDecrypt = () => {
    decryptMutation.mutate(
      { path: { fpId: entityId, signalId: riskSignalId } },
      {
        onError: () => {
          toast.show({
            title: t('protected-details.error.title'),
            description: t('protected-details.error.description'),
            variant: 'error',
          });
        },
      },
    );
  };

  return (
    <MatchesSection data-is-decrypted={!!aml}>
      {!aml && (
        <>
          <ProtectedDetails onClick={handleDecrypt} isPending={decryptMutation.isPending} />
          <HitsShimmer />
        </>
      )}
      <AmlSection>
        {aml?.shareUrl && (
          <Stack direction="column" width="100%" maxWidth="100%">
            <Text variant="label-3" color="tertiary" marginBottom={2}>
              {t('source-url.label')}
            </Text>
            <Stack align="center" gap={3}>
              <Box maxWidth="100%" overflow="hidden">
                <Text variant="body-3" truncate>
                  {aml.shareUrl}
                </Text>
              </Box>
              <CopyButton
                ariaLabel={t('source-url.aria-label')}
                contentToCopy={aml.shareUrl}
                tooltip={{ position: 'bottom' }}
              >
                <IcoCopy16 />
              </CopyButton>
            </Stack>
            <LinkButton
              variant="label-3"
              iconComponent={IcoArrowRightSmall16}
              iconPosition="right"
              href={aml.shareUrl}
              target="_blank"
              $marginTop={5}
              $marginBottom={5}
            >
              {t('source-url.read-full-report')}
            </LinkButton>
          </Stack>
        )}
        {aml?.hits.map((hit: AmlHit) => (
          <HitItem key={JSON.stringify(hit)} hit={hit} handleShowAmlMedia={handleShowAmlMedia} />
        ))}
      </AmlSection>
    </MatchesSection>
  );
};

const MatchesSection = styled.section`
  ${({ theme }) => css`
    height: 100%;
    position: relative;

    &[data-is-decrypted='true'] {
      margin-top: ${theme.spacing[5]};
    }
  `}
`;

const AmlSection = styled.div`
  display: flex;
  flex-direction: column;
`;

export default Matches;
