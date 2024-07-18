import { STATES } from '@onefootprint/global-constants';

const formatState = (state: string, emptyText = '-') => {
  const possibleState = STATES.find(s => s.value === state);
  return possibleState?.label || emptyText;
};

export default formatState;
