import React from 'react';
import styled, { css } from 'styled-components';

import CountrySpecificIdDocPicker from './components/country-specific-id-doc-picker';
import ExtraRequirements from './components/extra-requirements';
import GlobalIdDocPicker from './components/global-id-doc-picker';

const GovDocs = () => (
  <Container>
    <Section>
      <GlobalIdDocPicker />
    </Section>
    <Section>
      <CountrySpecificIdDocPicker />
    </Section>
    <Section>
      <ExtraRequirements />
    </Section>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[6]};
  `};
`;

const Section = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `};
`;

export default GovDocs;
