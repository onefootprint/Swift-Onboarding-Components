import { DeviceInfo, useDeviceInfo } from 'hooks';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { Events } from 'src/utils/state-machine/bifrost';
import styled, { css } from 'styled-components';
import { Box, Portal, Shimmer } from 'ui';

import useAuthenticationFlow from './hooks/use-authentication-flow';
import useTenantInfo from './hooks/use-tenant-info';
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
  useTenantInfo(tenantPk);
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
    margin-bottom: ${theme.spacing[8]}px;
    margin-top: ${theme.spacing[3] + theme.spacing[1]}px;
  `}
`;

const Title = () => (
  <Shimmer sx={{ width: '120px', height: '21px', marginBottom: 3 }} />
);

const Subtitle = () => <Shimmer sx={{ width: '228px', height: '17px' }} />;

const Label = () => (
  <Shimmer sx={{ width: '37px', height: '19.5px', marginBottom: 3 }} />
);

const Input = () => <Shimmer sx={{ width: '100%', height: '40px' }} />;

const Button = () => <Shimmer sx={{ width: '100%', height: '48px' }} />;

export default Init;
