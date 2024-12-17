import type { DIMetadata } from '@/idv/types';
import type { IdentifyRequirement, UserChallengeData } from '@onefootprint/request-types';
import type { IdentifyBootstrapData } from '../components/identify-login/state/types';
import validateBootstrapData from './validate-bootstrap-data';

export type State = {
  identifyToken: string;
  requirement?: IdentifyRequirement;
  /** The stack of previous requirements that can be re-visited using the back button. */
  requirementHistory: IdentifyRequirement[];
  email?: DIMetadata<string>;
  phoneNumber?: DIMetadata<string>;
  /* Hoisted to this level to avoid resetting challenge data when navigating back from the challenge screen */
  challengeData?: UserChallengeData;
};

export type NextAction = {
  type: 'next';
  requirement: IdentifyRequirement;
  identifyToken?: string;
  email?: string;
  phoneNumber?: string;
};

export type Action =
  | NextAction
  | { type: 'prev' }
  | { type: 'resetToLoginWithDifferentAccount' }
  | { type: 'setChallengeData'; challengeData?: UserChallengeData };

export const getInitialState = (bootstrapData?: IdentifyBootstrapData): State => {
  const { email, phoneNumber } = validateBootstrapData(bootstrapData);
  return {
    identifyToken: '',
    requirement: undefined,
    requirementHistory: [],
    email,
    phoneNumber,
    challengeData: undefined,
  };
};

const computeNextVaultData = (current?: DIMetadata<string>, value?: string) => {
  // Don't support clearing the value
  if (!value) return current;
  // If the value changes, clear the `isBootstrap` flag
  const isBootstrap = current?.value === value && current.isBootstrap;
  return { value, isBootstrap };
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'next': {
      const identifyToken = action.identifyToken || state.identifyToken;
      const email = computeNextVaultData(state.email, action.email);
      const phoneNumber = computeNextVaultData(state.phoneNumber, action.phoneNumber);
      const requirement = action.requirement;

      let requirementHistory = [...state.requirementHistory];
      if (state.requirement?.kind === 'challenge') {
        // Don't support going back to a challenge screen since the value cannot be undone
        requirementHistory = [];
      } else if (state.requirement) {
        requirementHistory = [state.requirement, ...requirementHistory];
      }

      return { identifyToken, requirement, requirementHistory, email, phoneNumber, challengeData: undefined };
    }
    case 'setChallengeData': {
      return { ...state, challengeData: action.challengeData };
    }
    case 'prev': {
      const { requirementHistory, requirement, ...restOfState } = state;
      const [prevRequirement, ...restOfLastHandledRequirements] = requirementHistory;
      return { ...restOfState, requirementHistory: restOfLastHandledRequirements, requirement: prevRequirement };
    }
    case 'resetToLoginWithDifferentAccount': {
      return getInitialState(undefined);
    }
    default:
      return state;
  }
};
