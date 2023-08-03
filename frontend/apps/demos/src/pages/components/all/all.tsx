import { FootprintComponentKind } from '@onefootprint/footprint-js';
import styled, { css } from '@onefootprint/styled';
import { Tab, Tabs, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import FormJsIntegration from './components/form-js';
import FormReactIntegration from './components/form-react';
import FormVanilla from './components/form-vanilla';
import Title from './components/title';
import VerifyJs from './components/verify-js';
import VerifyReactIntegration from './components/verify-react';

const AllComponents = () => {
  const [kind, setKind] = useState<FootprintComponentKind>(
    FootprintComponentKind.Verify,
  );

  return (
    <Container>
      <Tabs variant="underlined">
        {Object.values(FootprintComponentKind).map(k => (
          <Tab key={k} selected={k === kind} onClick={() => setKind(k)}>
            <Typography variant="label-2">{k}</Typography>
          </Tab>
        ))}
      </Tabs>
      <Title>React integrations</Title>
      <Framework>
        {kind === FootprintComponentKind.Form && <FormReactIntegration />}
        {kind === FootprintComponentKind.Verify && <VerifyReactIntegration />}
        {kind === FootprintComponentKind.Render && (
          <Typography variant="label-1">Coming soon</Typography>
        )}
      </Framework>
      <Title>JS integrations (init & render)</Title>
      <Framework>
        {kind === FootprintComponentKind.Verify && <VerifyJs />}
        {kind === FootprintComponentKind.Form && <FormJsIntegration />}
        {kind === FootprintComponentKind.Render && (
          <Typography variant="label-1">Coming soon</Typography>
        )}
      </Framework>
      <Title>Vanilla integrations</Title>
      <Framework>
        {kind === FootprintComponentKind.Form && <FormVanilla />}
        {kind === FootprintComponentKind.Render && (
          <Typography variant="label-1">Coming soon</Typography>
        )}
        {kind === FootprintComponentKind.Verify && (
          <Typography variant="label-1">Coming soon</Typography>
        )}
      </Framework>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[4]};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: ${theme.spacing[5]};
  `};
`;

const Framework = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin-bottom: ${theme.spacing[4]};
    border: 1px solid ${theme.borderColor.primary};
    min-width: 100%;
    min-height: 500px;
    flex-grow: 1;
    flex-wrap: wrap;
    overflow: auto;
    padding: ${theme.spacing[4]};
  `}
`;

export default AllComponents;
