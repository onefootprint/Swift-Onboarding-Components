export type Step = 'intro' | 'otp' | 'email' | 'basic-data' | 'address' | 'success';

export type UserData = {
  phoneNumber: string;
  email?: string;
};

export type State = {
  currentStep: Step;
  userData: UserData;
};

export type Action = { type: 'NEXT_STEP' } | { type: 'SET_USER_DATA'; payload: Partial<UserData> };

export const initialState: State = {
  currentStep: 'intro',
  userData: {
    phoneNumber: '',
  },
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'NEXT_STEP':
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
    case 'SET_USER_DATA':
      return { ...state, userData: { ...state.userData, ...action.payload } };
    default:
      return state;
  }
};
