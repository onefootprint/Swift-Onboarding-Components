import { STATES } from '@onefootprint/global-constants';

const getInitialState = (initialState?: string) => STATES.find(state => state.value === initialState) || initialState;

export default getInitialState;
