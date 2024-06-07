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

const BasicConfigurationHeader = () => <Shimmer height="24px" width="147px" marginBottom={6} />;

const UrlFields = () => (
  <Box>
    <Shimmer height="20px" width="27px" marginBottom={3} />
    <Shimmer height="20px" width="170px" />
  </Box>
);

const MethodFields = () => (
  <Box>
    <Shimmer height="20px" width="28px" marginBottom={3} />

    <Shimmer height="20px" width="95px" />
  </Box>
);

const AccessReasonFields = () => (
  <Box>
    <Shimmer height="20px" width="90px" marginBottom={3} />
    <Shimmer height="20px" width="103px" />
  </Box>
);

const HttpHeadersFields = () => (
  <Box>
    <Shimmer height="20px" width="41px" marginBottom={3} />
    <Shimmer height="20px" width="130px" />
  </Box>
);

const SecretHttpHeadersFields = () => (
  <Box>
    <Shimmer height="20px" width="41px" marginBottom={3} />
    <Shimmer height="20px" width="130px" />
  </Box>
);

const CustomHeadersHeader = () => <Shimmer height="24px" width="168px" marginBottom={6} />;

const ClientCertificateHeader = () => <Shimmer height="24px" width="300px" marginBottom={6} />;

const Download = () => (
  <Box>
    <Shimmer height="20px" width="75px" marginBottom={3} />
    <Shimmer height="20px" width="211px" />
  </Box>
);

export default Loading;
