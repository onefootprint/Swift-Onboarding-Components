import { DeviceInfo, useDeviceInfo } from '@onefootprint/hooks';
import { CollectedKycDataOptionLabels } from '@onefootprint/types';
import { Box, Portal, Shimmer } from '@onefootprint/ui';
import { useGetOnboardingConfig } from 'footprint-elements';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { Events } from 'src/utils/state-machine/bifrost';
import styled, { css } from 'styled-components';

import useAuthenticationFlow from './hooks/use-authentication-flow';
import useTenantPublicKey from './hooks/use-tenant-public-key';

const Init = () => {
  const tenantPk = useTenantPublicKey();
  const [, send] = useBifrostMachine();
  useDeviceInfo((info: DeviceInfo) => {
    send({
      type: Events.deviceInfoIdentified,
      payload: info,
    });
  });

  useGetOnboardingConfig(tenantPk, {
    onSuccess: ({ orgName, name, isLive, mustCollectData, canAccessData }) => {
      send({
        type: Events.tenantInfoRequestSucceeded,
        payload: {
          pk: tenantPk,
          orgName,
          name,
          isLive,
          mustCollectData: mustCollectData.map(
            (attr: string) => CollectedKycDataOptionLabels[attr],
          ),
          canAccessData: canAccessData.map(
            (attr: string) => CollectedKycDataOptionLabels[attr],
          ),
        },
      });
    },
    onError: () => {
      send({
        type: Events.tenantInfoRequestFailed,
      });
    },
  });
  useAuthenticationFlow();

  return (
    <Box>
      <Portal selector="#navigation-header-portal" removeContent>
        <HeaderContainer>
          <CloseButton />
        </HeaderContainer>
      </Portal>
      <TitleContainer>
        <Title />
        <Subtitle />
      </TitleContainer>
      <Box sx={{ marginBottom: 7 }}>
        <Label />
        <Input />
      </Box>
      <Button />
      <TermsOfService />
    </Box>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  height: 56px;
  align-items: center;
`;

const CloseButton = () => <Shimmer sx={{ width: '24px', height: '24px' }} />;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: ${theme.spacing[8]};
    margin-top: calc(${theme.spacing[3]} + ${theme.spacing[1]});
  `}
`;

const Title = () => (
  <Shimmer sx={{ width: '120px', height: '21px', marginBottom: 3 }} />
);

const Subtitle = () => <Shimmer sx={{ width: '228px', height: '17px' }} />;

const Label = () => (
  <Shimmer sx={{ width: '37px', height: '19.5px', marginBottom: 3 }} />
);

const TermsOfService = () => <Shimmer sx={{ width: '100%', height: '16px' }} />;

const Input = () => <Shimmer sx={{ width: '100%', height: '40px' }} />;

const Button = () => (
  <Shimmer sx={{ width: '100%', height: '48px', marginBottom: 5 }} />
);

export default Init;
