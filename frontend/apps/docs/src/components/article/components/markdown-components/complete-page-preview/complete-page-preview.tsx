import { IcoCheckCircle40 } from '@onefootprint/icons';
import {
  HeaderTitle,
  Layout,
  NavigationHeader,
} from '@onefootprint/idv-elements';
import styled, { css } from '@onefootprint/styled';
import { Box, LinkButton } from '@onefootprint/ui';
import React from 'react';

const CompletePagePreview = () => (
  <Box>
    <Container>
      <Layout
        options={{ hasDesktopBorderRadius: true }}
        tenantPk="ob_live_NCIvO0m9VVlxPy2p1BwzFf"
        onClose={() => {}}
      >
        <Page>
          <NavigationHeader button={{ variant: 'close' }} />
          <IcoCheckCircle40 color="success" />
          <Box sx={{ marginBottom: 4 }} />
          <HeaderTitle
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              zIndex: 3,
            }}
            title="Submission completed!"
            subtitle="Thanks for using Footprint to verify your identity."
          />
          <Box />
          <LinkButton sx={{ marginTop: 7 }}>Return to site</LinkButton>
        </Page>
      </Layout>
    </Container>
  </Box>
);

const Container = styled.div`
  ${({ theme }) => css`
    width: 720px;
    height: 620px;
    border-radius: ${theme.borderRadius.default};
    background: rgba(14, 20, 56, 0.2);
    overflow: auto;
    max-width: 100%;
    position: relative;
    ul {
      list-style: none;
    }
  `}
`;

const Page = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
`;

export default CompletePagePreview;
