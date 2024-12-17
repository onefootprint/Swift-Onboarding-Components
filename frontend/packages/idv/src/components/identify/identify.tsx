import { useFlags } from 'launchdarkly-react-client-sdk';
import { useReducer } from 'react';
import Challenge from './components/challenge';
import CollectEmail from './components/collect-email';
import CollectPhone from './components/collect-phone';
import { IdentifyLogin } from './components/identify-login';
import Init from './components/init';
import { type DoneArgs, IdentifyVariant, type InitArgs } from './identify.types';
import loadNextRequirement from './utils/load-requirements';
import { type NextAction, getInitialState } from './utils/reducer';
import { reducer } from './utils/reducer';

type IdentifyProps = {
  onDone: (args: DoneArgs) => void;
  initArgs: InitArgs;
};

const useIsInRollout = (orgId?: string) => {
  const { IdentifySignupV2Rollout } = useFlags();
  const orgIds = new Set<string>(IdentifySignupV2Rollout);
  if (orgIds.has('all')) {
    // Our representation of "fully rolled out"
    return true;
  }
  return orgId && orgIds.has(orgId);
};

const Identify = ({ onDone, initArgs }: IdentifyProps) => {
  const { bootstrapData, ...restOfInitArgs } = initArgs;
  const initialState = getInitialState(bootstrapData);
  const [state, dispatch] = useReducer(reducer, initialState);
  const isInRollout = useIsInRollout(initArgs.config?.orgId);

  // TODO: before supporting auth, need the auth app to select sandbox ID
  if (initArgs.initialAuthToken || !isInRollout || initArgs.variant !== IdentifyVariant.verify) {
    // If this tenant is not rolled out to use the new Identify signup flow, fall back to legacy Identify component.
    // Or, if the Identify flow is initialized with an initialAuthToken, fall back to our legacy IdentifyLogin component that handles login.
    const machineArgs = { ...restOfInitArgs, email: state.email, phoneNumber: state.phoneNumber };
    return <IdentifyLogin initialArgs={machineArgs} onDone={onDone} />;
  }

  const handleAdvanceToNext = async (args: Partial<Omit<NextAction, 'type'>>, delayMs?: number) => {
    const identifyToken = args.identifyToken || state.identifyToken;
    const nextRequirement = await loadNextRequirement(identifyToken);

    const next = () => {
      if (nextRequirement.kind === 'handleNextRequirement') {
        dispatch({ type: 'next', ...args, requirement: nextRequirement.requirement });
      } else if (nextRequirement.kind === 'done') {
        onDone({ authToken: nextRequirement.authToken, email: state.email, phoneNumber: state.phoneNumber });
      }
    };
    if (delayMs) {
      setTimeout(next, delayMs);
    } else {
      next();
    }
  };

  const handleReset = () => {
    dispatch({ type: 'resetToLoginWithDifferentAccount' });
  };
  const onPrev = state.requirementHistory.length > 0 ? () => dispatch({ type: 'prev' }) : undefined;

  const { requirement, identifyToken } = state;
  const context = { state, initArgs: restOfInitArgs, onPrev };

  if (!identifyToken || !requirement) {
    return <Init context={context} onDone={identifyToken => handleAdvanceToNext({ identifyToken })} />;
  }
  if (requirement.kind === 'collect_data' && requirement.cdo === 'email') {
    return <CollectEmail context={context} onDone={email => handleAdvanceToNext({ email })} />;
  }
  if (requirement.kind === 'collect_data' && requirement.cdo === 'phone_number') {
    return <CollectPhone context={context} onDone={phoneNumber => handleAdvanceToNext({ phoneNumber })} />;
  }
  if (requirement.kind === 'challenge') {
    return (
      <Challenge
        context={context}
        requirement={requirement}
        onDone={delayMs => handleAdvanceToNext({}, delayMs)}
        onReset={handleReset}
        setChallengeData={challengeData => dispatch({ type: 'setChallengeData', challengeData })}
        // Re-render the component when the challenge kind changes
        key={requirement.authMethod}
      />
    );
  }
  if (requirement.kind === 'login') {
    // Share the phone and email entered by the user in this flow
    const initialAuthToken = requirement.user.token;
    const loginArgs = { ...restOfInitArgs, initialAuthToken, email: state.email, phoneNumber: state.phoneNumber };
    // If a user is identified (or if the Identify flow is initialized with an initialAuthToken),
    // we will fall back to our legacy IdentifyLogin component that handles login.
    return <IdentifyLogin initialArgs={loginArgs} onDone={onDone} onBack={onPrev} handleReset={handleReset} />;
  }
};

export default Identify;
