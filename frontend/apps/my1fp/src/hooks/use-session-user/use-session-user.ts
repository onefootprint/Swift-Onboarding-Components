import create from 'zustand';

export type UserSession = {
  dob?: string;
  email?: string;
  firstName?: string;
  isEmailVerified?: boolean;
  lastName?: string;
  phone?: string;
  ssn?: string;
  hasSSNFilled?: boolean;
  wasLoggedUsingBiometrics?: boolean;
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
  dob: '03/10/1990',
  email: 'john.doe@gmail.com',
  firstName: 'John',
  isEmailVerified: false,
  lastName: 'Doe',
  phone: '+1 (305) 541-3102',
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
