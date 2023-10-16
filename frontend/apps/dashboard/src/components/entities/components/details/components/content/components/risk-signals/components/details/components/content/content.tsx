import styled from '@onefootprint/styled';
import type { RiskSignal } from '@onefootprint/types';
import { Divider } from '@onefootprint/ui';
import React from 'react';

import Matches from './components/matches';
import Overview from './components/overview';

type ContentProps = {
  riskSignal: RiskSignal;
};

const Content = ({ riskSignal }: ContentProps) => (
  <ContentContainer>
    <Overview
      description={riskSignal.description}
      scopes={riskSignal.scopes}
      severity={riskSignal.severity}
    />
    {riskSignal.hasAmlHits && (
      <>
        <Divider />
        <Matches riskSignalId={riskSignal.id} />
      </>
    )}
  </ContentContainer>
);

const ContentContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export default Content;
