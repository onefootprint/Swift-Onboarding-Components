import { FootprintComponentKind } from '@onefootprint/footprint-js';
import { Tab, Tabs, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import FormJsIntegration from './components/form-js';
import FormReactIntegration from './components/form-react';
import FormVanilla from './components/form-vanilla';
import RenderJs from './components/render-js';
import Title from './components/title';
import VerifyButtonReactIntegration from './components/verify-button-react';
import VerifyJs from './components/verify-js';

const Soon = () => <Typography variant="label-1">Coming soon</Typography>;

const AllComponents = () => {
  const { Auth, Form, Render, Verify, VerifyButton } = FootprintComponentKind;
  const [kind, setKind] = useState<FootprintComponentKind>(VerifyButton);

  return (
    <Container>
      <Tabs>
        {Object.values(FootprintComponentKind)
          .filter(k => k !== Auth)
          .map((k: FootprintComponentKind) => (
            <Tab key={k} selected={k === kind} onClick={() => setKind(k)}>
              <Typography as="span" variant="label-2">
                {k}
              </Typography>
            </Tab>
          ))}
      </Tabs>
      <Title>React integrations</Title>
      <Framework>
        {kind === Form && <FormReactIntegration />}
        {kind === Render && <Soon />}
        {kind === Verify && <Soon />}
        {kind === VerifyButton && <VerifyButtonReactIntegration />}
      </Framework>
      <Title>JS integrations</Title>
      <Framework>
        {kind === Form && <FormJsIntegration />}
        {kind === Render && <RenderJs />}
        {kind === Verify && <VerifyJs />}
        {/* {kind === VerifyButton && <VerifyButtonJsIntegration />} */}
      </Framework>
      <Title>Vanilla integrations</Title>
      <Framework>
        {kind === Form && <FormVanilla />}
        {kind === Render && <Soon />}
        {kind === Verify && <Soon />}
        {/* {kind === VerifyButton && <VerifyButtonVanilla />} */}
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
