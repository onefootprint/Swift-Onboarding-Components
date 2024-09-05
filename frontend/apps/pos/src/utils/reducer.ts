export type State = {
  currentStep: 'intro' | 'otp' | 'email' | 'basic-data' | 'address' | 'success';
};

export type Action = {
  type: 'NEXT_STEP';
};

export const initialState: State = {
  currentStep: 'intro',
};

export const reducer = (state: State, action: Action): State => {
  if (action.type === 'NEXT_STEP') {
    switch (state.currentStep) {
      case 'intro':
        return { ...state, currentStep: 'otp' };
      case 'otp':
        return { ...state, currentStep: 'email' };
      case 'email':
        return { ...state, currentStep: 'basic-data' };
      case 'basic-data':
        return { ...state, currentStep: 'address' };
      case 'address':
        return { ...state, currentStep: 'success' };
      default:
        return state;
    }
  }
  return state;
};
