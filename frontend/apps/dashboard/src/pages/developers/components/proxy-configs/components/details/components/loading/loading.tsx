import { Box, Shimmer } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const Loading = () => (
  <Box testID="proxy-configs-details-loading" aria-busy>
    <Fieldset>
      <BasicConfigurationHeader />
      <Fields>
        <UrlFields />
        <MethodFields />
        <AccessReasonFields />
      </Fields>
    </Fieldset>
    <Fieldset>
      <CustomHeadersHeader />
      <Fields>
        <SecretHttpHeadersFields />
        <SecretHttpHeadersFields />
        <HttpHeadersFields />
        <HttpHeadersFields />
      </Fields>
    </Fieldset>
    <Fieldset>
      <ClientCertificateHeader />
      <Fields>
        <Download />
      </Fields>
    </Fieldset>
  </Box>
);

const Fieldset = styled.div`
  ${({ theme }) => css`
    &:not(:last-child) {
      border-bottom: 1px solid ${theme.borderColor.tertiary};
      margin-bottom: ${theme.spacing[7]};
      padding-bottom: ${theme.spacing[7]};
    }
  `};
`;

const Fields = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `};
`;

const BasicConfigurationHeader = () => (
  <Shimmer sx={{ width: '147px', height: '24px', marginBottom: 6 }} />
);

const UrlFields = () => (
  <Box>
    <Shimmer sx={{ width: '27px', height: '20px', marginBottom: 3 }} />
    <Shimmer sx={{ width: '170px', height: '20px' }} />
  </Box>
);

const MethodFields = () => (
  <Box>
    <Shimmer sx={{ width: '28px', height: '20px', marginBottom: 3 }} />
    <Shimmer sx={{ width: '95px', height: '20px' }} />
  </Box>
);

const AccessReasonFields = () => (
  <Box>
    <Shimmer sx={{ width: '90px', height: '20px', marginBottom: 3 }} />
    <Shimmer sx={{ width: '103px', height: '20px' }} />
  </Box>
);

const HttpHeadersFields = () => (
  <Box>
    <Shimmer sx={{ width: '41px', height: '20px', marginBottom: 3 }} />
    <Shimmer sx={{ width: '130px', height: '20px' }} />
  </Box>
);

const SecretHttpHeadersFields = () => (
  <Box>
    <Shimmer sx={{ width: '41px', height: '20px', marginBottom: 3 }} />
    <Shimmer sx={{ width: '130px', height: '20px' }} />
  </Box>
);

const CustomHeadersHeader = () => (
  <Shimmer sx={{ width: '168px', height: '24px', marginBottom: 6 }} />
);

const ClientCertificateHeader = () => (
  <Shimmer sx={{ width: '300px', height: '24px', marginBottom: 6 }} />
);

const Download = () => (
  <Box>
    <Shimmer sx={{ width: '75px', height: '20px', marginBottom: 3 }} />
    <Shimmer sx={{ width: '211px', height: '20px' }} />
  </Box>
);

export default Loading;
