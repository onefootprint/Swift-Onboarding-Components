import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import useLogStateMachine from '../../../../hooks/ui/use-log-state-machine';
import { trackAction } from '../../../../utils/logger';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import Animation from '../animation';
import Confirm from '../confirm/confirm';
import Declarations from '../declarations';
import Employment from '../employment';
import Income from '../income';
import InvestmentGoals from '../investment-goals';
import NetWorth from '../net-worth';
import RiskTolerance from '../risk-tolerance';

type RouterProps = { onDone: () => void };

const Router = ({ onDone }: RouterProps) => {
  const [state, send] = useInvestorProfileMachine();
  const { showTransition, data } = state.context;
  const isDone = state.matches('completed');
  const { t } = useTranslation('idv', { keyPrefix: 'investor-profile.pages' });
  const [displayAnimation, setDisplayAnimation] = useState(() => showTransition && Object.keys(data).length === 0);

  const handleOnBack = () => send('navigatedToPrevPage');

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
    return displayAnimation ? (
      <Animation onAnimationEnd={() => setDisplayAnimation(false)} />
    ) : (
      <>
        <NavigationHeader leftButton={{ confirmClose: true, variant: 'close' }} />
        <HeaderTitle title={t('employment.title')} subtitle={t('employment.subtitle')} marginBottom={7} />
        <Employment />
      </>
    );
  }
  if (state.matches('income')) {
    return (
      <>
        <NavigationHeader leftButton={{ onBack: handleOnBack, variant: 'back' }} />
        <HeaderTitle title={t('income.title')} subtitle={t('income.subtitle')} marginBottom={7} />
        <Income />
      </>
    );
  }
  if (state.matches('netWorth')) {
    return (
      <>
        <NavigationHeader leftButton={{ onBack: handleOnBack, variant: 'back' }} />
        <HeaderTitle title={t('net-worth.title')} subtitle={t('net-worth.subtitle')} marginBottom={7} />
        <NetWorth />
      </>
    );
  }
  if (state.matches('investmentGoals')) {
    return (
      <>
        <NavigationHeader leftButton={{ onBack: handleOnBack, variant: 'back' }} />
        <HeaderTitle title={t('investment-goals.title')} subtitle={t('investment-goals.subtitle')} marginBottom={7} />
        <InvestmentGoals />
      </>
    );
  }
  if (state.matches('riskTolerance')) {
    return (
      <>
        <NavigationHeader leftButton={{ onBack: handleOnBack, variant: 'back' }} />
        <HeaderTitle title={t('risk-tolerance.title')} subtitle={t('risk-tolerance.subtitle')} marginBottom={7} />
        <RiskTolerance />
      </>
    );
  }
  if (state.matches('declarations')) {
    return (
      <>
        <NavigationHeader leftButton={{ onBack: handleOnBack, variant: 'back' }} />
        <HeaderTitle title={t('declarations.title')} subtitle={t('declarations.subtitle')} marginBottom={7} />
        <Declarations />
      </>
    );
  }
  if (state.matches('confirm')) {
    return (
      <>
        <NavigationHeader leftButton={{ onBack: handleOnBack, variant: 'back' }} />
        <HeaderTitle title={t('confirm.title')} subtitle={t('confirm.subtitle')} marginBottom={7} />
        <Confirm />
      </>
    );
  }

  return null;
};

export default Router;
