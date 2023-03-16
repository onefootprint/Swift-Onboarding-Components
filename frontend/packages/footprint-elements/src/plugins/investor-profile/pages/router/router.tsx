import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import BrokerageEmployment from '../brokerage-employment';
import ConflictOfInterest from '../conflict-of-interest';
import Employment from '../employment';
import Income from '../income';
import NetWorth from '../net-worth';
import RiskTolerance from '../risk-tolerance';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useInvestorProfileMachine();
  const isDone = state.matches('completed');
  useLogStateMachine('investor-profile', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches('employment')) {
    return <Employment />;
  }
  if (state.matches('brokerageEmployment')) {
    return <BrokerageEmployment />;
  }
  if (state.matches('income')) {
    return <Income />;
  }
  if (state.matches('netWorth')) {
    return <NetWorth />;
  }
  if (state.matches('riskTolerance')) {
    return <RiskTolerance />;
  }
  if (state.matches('conflictOfInterest')) {
    return <ConflictOfInterest />;
  }

  return <div>Router</div>;
};

export default Router;
