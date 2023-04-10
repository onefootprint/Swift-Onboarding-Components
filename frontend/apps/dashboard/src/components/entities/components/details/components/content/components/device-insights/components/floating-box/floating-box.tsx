import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle16, IcoClose16 } from '@onefootprint/icons';
import { EntityKind } from '@onefootprint/types';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import { displayForUserAgent, icoForUserAgent } from 'src/utils/user-agent';
import styled, { css } from 'styled-components';

import { useEntityContext } from '@/entity/hooks/use-entity-context';

import getRegion from './utils/get-region';

export type FloatingBoxProps = {
  city: string | null;
  country: string | null;
  hasBiometrics: boolean;
  ipAddress: string | null;
  region: string | null;
  userAgent: string | null;
};

const FloatingBox = ({
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
    <Container>
      {icoForUserAgent(userAgentText)}
      <Typography variant="label-2" sx={{ marginBottom: 5 }} isPrivate>
        {displayForUserAgent(userAgentText)}
      </Typography>
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
    left: ${theme.spacing[10]};
    min-width: 240px;
    padding: ${theme.spacing[7]};
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 33%;
  `};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export default FloatingBox;
