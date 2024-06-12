import React, { useEffect } from 'react';

import useLogStateMachine from '../../../../hooks/ui/use-log-state-machine';
import { trackAction } from '../../../../utils/logger';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import Declarations from '../declarations';
import Employment from '../employment';
import Income from '../income';
import InvestmentGoals from '../investment-goals';
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
    trackAction('investor-profile:started');
  }, []);

  useEffect(() => {
    if (isDone) {
      onDone();
      trackAction('investor-profile:completed');
    }
  }, [isDone, onDone]);

  if (state.matches('employment')) {
    return <Employment />;
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
  if (state.matches('investmentGoals')) {
    return <InvestmentGoals />;
  }
  if (state.matches('declarations')) {
    return <Declarations />;
  }

  return null;
};

export default Router;
