import create from 'zustand';

export type UserSession = {
  dob: string | null;
  email: string;
  firstName: string | null;
  isEmailVerified?: boolean;
  isBiometricsVerified?: boolean;
  device?: string;
  lastName: string | null;
  phoneNumber: string | null;
  ssn?: string | null;
  hasSSNFilled?: boolean;
  wasLoggedUsingBiometrics?: boolean;
  streetAddress: string | null;
  streetAddress2: string | null;
  city: string | null;
  zip: string | null;
  state: string | null;
  country: string | null;
  authToken: string;
};

type UserSessionState = {
  data: UserSession;
  logIn: (data: UserSession) => void;
  logOut: () => void;
};

// TODO: Integrate with backend
const initialMe = {
  hasSSNFilled: true,
  wasLoggedUsingBiometrics: false,
  isBiometricsVerified: false,
  device: 'iPhone 12',
  dob: '03/10/1990',
  email: 'john.doe@gmail.com',
  firstName: 'John',
  isEmailVerified: false,
  lastName: 'Doe',
  phoneNumber: '+1 (305) 541-3102',
  streetAddress: '158 West 23 Street',
  streetAddress2: 'Apt 107',
  city: 'New York',
  zip: '94107',
  state: 'NY',
  country: 'USA',
  authToken: '',
};

// TODO: Enable persist
// https://linear.app/footprint/issue/FP-515/enable-zustand-persist
export const useStore = create<UserSessionState>(set => ({
  data: initialMe,
  logIn: (data: UserSession) => set({ data }),
  logOut: () => set({ data: undefined }),
}));

const useSessionUser = () => {
  const { data, logIn, logOut } = useStore(state => state);
  const isLoggedIn = !!data;

  return { data, isLoggedIn, logIn, logOut };
};

export default useSessionUser;
