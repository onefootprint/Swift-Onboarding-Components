import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { displayForUserAgent, icoForUserAgent } from 'src/utils/user-agent';
import styled, { css } from 'styled-components';

import getRegion from './utils/get-region';

export type FloatingBoxProps = {
  city: string | null;
  country: string | null;
  ipAddress: string | null;
  region: string | null;
  userAgent: string | null;
};

const FloatingBox = ({
  city,
  country,
  ipAddress,
  region,
  userAgent,
}: FloatingBoxProps) => {
  const { t } = useTranslation('pages.business.device-insights');
  const userAgentText = userAgent || '';
  const fullRegion = getRegion(city, region);

  return (
    <Container role="region" title={t('title')}>
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
