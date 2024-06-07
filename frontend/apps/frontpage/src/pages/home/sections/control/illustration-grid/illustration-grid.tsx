import { Grid, Stack, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import AdditionalDocumentsCard from './cards/additional-documents-card';
import AmlCard from './cards/aml-card';
import EditingAdditionalDocsCard from './cards/editing-additional-docs-card';
import EmptyCard from './cards/empty-card';
import GovernmentIdCard from './cards/government-id-card';
import InvestorQuestionsCard from './cards/investor-questions-card';
import KycCard from './cards/kyc-card';
import PersonalInformationCard from './cards/personal-information-card';

const IllustrationGrid = () => (
  <Container>
    <GridContainer>
      <Column>
        <KycCard />
        <InvestorQuestionsCard />
        <AdditionalDocumentsCard />
        <EmptyCard height="100%" />
        <IDCardMobile />
      </Column>
      <Column>
        <PersonalInformationCard />
        <EmptyCard height="96px" />
        <EmptyCard height="96px" />
        <PositionedGovernmentIdCard />
      </Column>
      <Column>
        <EditingAdditionalDocsCard />
        <AmlCard />
        <EmptyCard height="96px" />
        <EmptyCard height="100%" />
      </Column>
    </GridContainer>
  </Container>
);

const GridContainer = styled(Grid.Container)`
  ${({ theme }) => css`
    max-width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    padding: 0 ${theme.spacing[3]};
    position: relative;

    ${media.greaterThan('md')`
      display: grid;
      grid-template-columns: repeat(3, 520px);
      justify-content: center;
      align-items: flex-start;
      column-gap: ${theme.spacing[3]};
    `}
  `}
`;

const Container = styled(Stack)`
  max-height: 820px;
  align-items: flex-start;
  mask: linear-gradient(to bottom, black 0%, black 85%, transparent 100%);
  mask-type: alpha;

  ${media.greaterThan('md')`
    align-items: flex-start;
  `}
`;

const Column = styled(Grid.Item)`
  ${({ theme }) => css`
    position: relative;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    height: 100%;
  `}
`;

const PositionedGovernmentIdCard = styled(GovernmentIdCard)`
  ${({ theme }) => css`
    position: absolute;
    bottom: 60px;
    left: -8px;
    z-index: 1;
    box-shadow: ${theme.elevation[3]};
    transform: rotate(8deg);
  `}
`;

const IDCardMobile = styled(GovernmentIdCard)`
  ${({ theme }) => css`
    display: block;
    position: absolute;
    bottom: -380px;
    left: 24px;
    z-index: 1;
    box-shadow: ${theme.elevation[3]};
    transform: rotate(8deg);

    ${media.greaterThan('md')`
      display: none;
    `}
  `}
`;

export default IllustrationGrid;
