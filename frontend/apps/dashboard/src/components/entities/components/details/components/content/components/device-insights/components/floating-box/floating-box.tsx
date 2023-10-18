import { useTranslation } from '@onefootprint/hooks';
import {
  IcoAppclip16,
  IcoBolt16,
  IcoCheckCircle16,
  IcoClose16,
  IcoForbid40,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { EntityKind } from '@onefootprint/types';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import { displayForUserAgent, icoForUserAgent } from 'src/utils/user-agent';

import { useEntityContext } from '@/entity/hooks/use-entity-context';

import AboutAppClipAndInstantApp from './components/about-app-clip-and-instant-app';
import getRegion from './utils/get-region';

export type FloatingBoxProps = {
  city: string | null;
  country: string | null;
  hasBiometrics: boolean;
  hasInsights: boolean;
  ipAddress: string | null;
  deviceInfo: { appClip: boolean; instantApp: boolean; web: boolean };
  region: string | null;
  userAgent: string | null;
};

const FloatingBox = ({
  city,
  country,
  hasBiometrics,
  hasInsights,
  ipAddress,
  deviceInfo,
  region,
  userAgent,
}: FloatingBoxProps) => {
  const { t } = useTranslation('pages.entity.device-insights');
  const context = useEntityContext();
  const userAgentText = userAgent || '';
  const fullRegion = getRegion(city, region);

  return (
    <Container data-has_insights={hasInsights}>
      {hasInsights ? (
        icoForUserAgent(
          userAgentText,
          deviceInfo.instantApp,
          deviceInfo.appClip,
        )
      ) : (
        <IcoForbid40 />
      )}
      <Typography
        variant={hasInsights ? 'label-2' : 'label-1'}
        sx={{
          marginBottom: hasInsights ? 5 : 0,
          marginTop: hasInsights ? 0 : 5,
        }}
        isPrivate
      >
        {hasInsights
          ? displayForUserAgent(
              userAgentText,
              deviceInfo.instantApp,
              deviceInfo.appClip,
            )
          : t('no-insights.title')}
      </Typography>
      {hasInsights && (
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
            <>
              <Row role="row" aria-label={t('biometrics')}>
                <Typography variant="body-3" color="tertiary">
                  {t('biometrics')}
                </Typography>

                <Stack align="center" gap={3}>
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
                </Stack>
              </Row>
              {deviceInfo.instantApp && (
                <Row role="row" aria-label={t('instant-app.label')}>
                  <Stack direction="row" align="center" gap={2}>
                    <Typography variant="body-3" color="tertiary">
                      {t('instant-app.label')}
                    </Typography>
                    <AboutAppClipAndInstantApp kind="instant-app" />
                  </Stack>
                  <Stack direction="row" align="center" gap={3}>
                    <IcoBolt16 />
                    <Typography variant="body-3" isPrivate>
                      {t('instant-app.yes')}
                    </Typography>
                  </Stack>
                </Row>
              )}
              {deviceInfo.appClip && (
                <Row role="row" aria-label={t('app-clip.label')}>
                  <Stack direction="row" align="center" gap={2}>
                    <Typography variant="body-3" color="tertiary">
                      {t('app-clip.label')}
                    </Typography>
                    <AboutAppClipAndInstantApp kind="app-clip" />
                  </Stack>
                  <Stack direction="row" align="center" gap={3}>
                    <IcoAppclip16 />
                    <Typography variant="body-3" isPrivate>
                      {t('app-clip.yes')}
                    </Typography>
                  </Stack>
                </Row>
              )}
            </>
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
