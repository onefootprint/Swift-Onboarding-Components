import { useTranslation } from '@onefootprint/hooks';
import { IcoArrowRightSmall16, IcoCopy16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { RoleScopeKind } from '@onefootprint/types';
import {
  CopyButton,
  createFontStyles,
  LinkButton,
  Stack,
  Typography,
  useToast,
} from '@onefootprint/ui';
import React from 'react';
import usePermissions from 'src/hooks/use-permissions';

import Hits from './components/hits';
import HitsShimmer from './components/hits-shimmer';
import ProtectedDetails from './components/protected-details';
import useCachedRiskSignalAmlHint from './hooks/use-cached-risk-signal-aml-hint';
import useRiskSignalAmlHits from './hooks/use-risk-signal-aml-hits';

type MatchesProps = {
  riskSignalId: string;
};

const Matches = ({ riskSignalId }: MatchesProps) => {
  const { t } = useTranslation('pages.entity.risk-signals.details.matches');
  const cachedAmlHint = useCachedRiskSignalAmlHint(riskSignalId);
  const decryptMutation = useRiskSignalAmlHits();
  const aml = decryptMutation.data || cachedAmlHint;
  const { hasPermission } = usePermissions();
  const toast = useToast();

  const handleDecrypt = () => {
    decryptMutation.mutate(riskSignalId, {
      onError: () => {
        toast.show({
          title: t('errors.title'),
          description: t('errors.description'),
          variant: 'error',
        });
      },
    });
  };

  return (
    <MatchesSection data-is-decrypted={!!aml}>
      {!aml && (
        <>
          <ProtectedDetails
            canDecrypt={hasPermission(RoleScopeKind.orgSettings)}
            onClick={handleDecrypt}
            isLoading={decryptMutation.isLoading}
          />
          <HitsShimmer />
        </>
      )}
      {aml?.shareUrl && (
        <AmlSection>
          <Stack direction="column" sx={{ width: '100%' }}>
            <Typography
              variant="label-3"
              color="tertiary"
              sx={{ marginBottom: 2 }}
            >
              {t('source-url.label')}
            </Typography>
            <Stack align="center" justify="space-between">
              <SourceUrl>{aml.shareUrl}</SourceUrl>
              <CopyButton
                ariaLabel={t('source-url.copy')}
                contentToCopy={aml.shareUrl}
                tooltipPosition="bottom"
              >
                <IcoCopy16 />
              </CopyButton>
            </Stack>
            <LinkButton
              size="tiny"
              iconComponent={IcoArrowRightSmall16}
              iconPosition="right"
              href={aml.shareUrl}
              target="_blank"
              sx={{ marginTop: 5, marginBottom: 5 }}
            >
              {t('source-url.read-full-report')}
            </LinkButton>
          </Stack>
          {aml?.hits && aml.hits.length > 0 && <Hits hits={aml.hits} />}
        </AmlSection>
      )}
    </MatchesSection>
  );
};

const MatchesSection = styled.section`
  ${({ theme }) => css`
    height: 100%;
    margin-top: ${theme.spacing[5]};
    position: relative;

    &[data-is-decrypted='false'] {
      overflow: hidden;
    }
  `}
`;

const AmlSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const SourceUrl = styled.p`
  width: 90%;
  ${createFontStyles('body-3')};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export default Matches;
