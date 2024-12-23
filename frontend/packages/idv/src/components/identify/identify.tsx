import type { IdentifiedUser } from '@onefootprint/types/src/api/identify';
import { useReducer } from 'react';
import Challenge from './components/challenge';
import CollectEmail from './components/collect-email';
import CollectPhone from './components/collect-phone';
import { IdentifyLogin, IdentifyLoginAuthToken } from './components/identify-login';
import Init from './components/init';
import type { DoneArgs, InitArgs } from './identify.types';
import loadNextRequirement from './utils/load-requirements';
import { type NextAction, getInitialState, reducer } from './utils/reducer';

type IdentifyProps = {
  onDone: (args: DoneArgs) => void;
  initArgs: InitArgs;
};

const Identify = ({ onDone, initArgs }: IdentifyProps) => {
  const { bootstrapData, initialAuthToken, ...restOfInitArgs } = initArgs;
  const initialState = getInitialState(bootstrapData);
  const [state, dispatch] = useReducer(reducer, initialState);

  if (initialAuthToken) {
    // If the Identify flow is initialized with an initialAuthToken, fall back to our legacy IdentifyLogin component that handles login.
    const initialArgs = { ...restOfInitArgs, email: state.email, phoneNumber: state.phoneNumber, initialAuthToken };
    return <IdentifyLoginAuthToken initialArgs={initialArgs} onDone={onDone} />;
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
    const machineArgs = {
      ...restOfInitArgs,
      email: state.email,
      phoneNumber: state.phoneNumber,
      identify: {
        user: requirement.user as IdentifiedUser,
        identifyToken: requirement.user.token,
      },
    };
    // If a user is identified (or if the Identify flow is initialized with an initialAuthToken),
    // we will fall back to our legacy IdentifyLogin component that handles login.
    return <IdentifyLogin machineArgs={machineArgs} onDone={onDone} onBack={onPrev} handleReset={handleReset} />;
  }
};

export default Identify;
