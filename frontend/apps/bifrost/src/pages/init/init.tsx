import React from 'react';
import styled, { css } from 'styled-components';
import { Box, Shimmer } from 'ui';

import useDeviceInfo from './hooks/use-device-info';
import useTenantInfo from './hooks/use-tenant-info';
import useTenantPublicKey from './hooks/use-tenant-public-key';

const Init = () => {
  const tenantPk = useTenantPublicKey();
  useDeviceInfo();
  useTenantInfo(tenantPk);

  return (
    <InitContainer>
      <Header>
        <Title />
        <Subtitle />
      </Header>
      <Box>
        <Label />
        <Input />
      </Box>
      <Button />
    </InitContainer>
  );
};

const InitContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[7]}px;
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: ${theme.spacing[1] + theme.spacing[2]}px;
  `}
`;

// These are shimmer imitating the email-identification page
const Title = () => (
  <Shimmer sx={{ width: '120px', height: '25px', marginBottom: 2 }} />
);

const Subtitle = () => <Shimmer sx={{ width: '228px', height: '21px' }} />;

const Label = () => (
  <Shimmer sx={{ width: '37px', height: '19.5px', marginBottom: 3 }} />
);

const Input = () => <Shimmer sx={{ width: '100%', height: '40px' }} />;

const Button = () => <Shimmer sx={{ width: '100%', height: '48px' }} />;

export default Init;
