import { STATES } from 'global-constants';

export const getInitialState = (initialState?: string) =>
  STATES.find(state => state.value === initialState) || initialState;

export default getInitialState;
