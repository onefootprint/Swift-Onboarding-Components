import states from '@/constants/states';

const getInitialState = (initialState?: string) => states.find(state => state.value === initialState) || initialState;

export default getInitialState;
