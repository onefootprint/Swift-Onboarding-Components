import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle16, IcoClose16, IcoForbid40 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { EntityKind } from '@onefootprint/types';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import { displayForUserAgent, icoForUserAgent } from 'src/utils/user-agent';

import { useEntityContext } from '@/entity/hooks/use-entity-context';

import getRegion from './utils/get-region';

export type FloatingBoxProps = {
  hasInsights: boolean;
  city: string | null;
  country: string | null;
  hasBiometrics: boolean;
  ipAddress: string | null;
  region: string | null;
  userAgent: string | null;
};

const FloatingBox = ({
  hasInsights,
  city,
  country,
  hasBiometrics,
  ipAddress,
  region,
  userAgent,
}: FloatingBoxProps) => {
  const { t } = useTranslation('pages.entity.device-insights');
  const context = useEntityContext();
  const userAgentText = userAgent || '';
  const fullRegion = getRegion(city, region);

  return (
    <Container data-has_insights={hasInsights}>
      {hasInsights ? icoForUserAgent(userAgentText) : <IcoForbid40 />}
      <Typography
        variant={hasInsights ? 'label-2' : 'label-1'}
        sx={{
          marginBottom: hasInsights ? 5 : 0,
          marginTop: hasInsights ? 0 : 5,
        }}
        isPrivate
      >
        {hasInsights
          ? displayForUserAgent(userAgentText)
          : t('vault-only.title')}
      </Typography>
      {hasInsights ? (
        <>
          {ipAddress && (
            <Row role="row" aria-label={t('ip-address')}>
              <Typography variant="body-3" color="tertiary">
                {t('ip-address')}
              </Typography>
              <Typography variant="body-3" isPrivate>
                {ipAddress}
              </Typography>
            </Row>
          )}
          {context.kind === EntityKind.person ? (
            <Row role="row" aria-label={t('biometrics')}>
              <Typography variant="body-3" color="tertiary">
                {t('biometrics')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {hasBiometrics ? (
                  <>
                    <IcoCheckCircle16 color="success" />
                    <Typography variant="body-3" color="success">
                      {t('verified')}
                    </Typography>
                  </>
                ) : (
                  <>
                    <IcoClose16 color="error" />
                    <Typography variant="body-3" color="error">
                      {t('not_verified')}
                    </Typography>
                  </>
                )}
              </Box>
            </Row>
          ) : null}
          {fullRegion && (
            <Row role="row" aria-label={t('region')}>
              <Typography variant="body-3" color="tertiary">
                {t('region')}
              </Typography>
              <Typography variant="body-3" isPrivate>
                {fullRegion}
              </Typography>
            </Row>
          )}
          {country && (
            <Row role="row" aria-label={t('country')}>
              <Typography variant="body-3" color="tertiary">
                {t('country')}
              </Typography>
              <Typography variant="body-3" isPrivate>
                {country}
              </Typography>
            </Row>
          )}
        </>
      ) : (
        <Typography
          variant="body-2"
          sx={{ margin: 3, marginTop: 0, textAlign: 'center' }}
        >
          {t('vault-only.message')}
        </Typography>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[3]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    min-width: 240px;
    padding: ${theme.spacing[7]};
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 33%;

    &[data-has_insights='false'] {
      left: 33%;
    }

    &[data-has_insights='true'] {
      left: ${theme.spacing[10]};
    }
  `};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export default FloatingBox;
