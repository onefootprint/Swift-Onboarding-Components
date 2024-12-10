import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useCallback, useState } from 'react';

import { obConfig } from './config/constants';
import IntroStep from './pages/intro-step';
import OnboardingStep from './pages/onboarding-step';
import SuccessStep from './pages/success-step';
import WaitingStep from './pages/waiting-step';

const sandboxId = Math.random().toString(36).substring(2, 12);
const queryClient = new QueryClient();

type AppContextState = {
  sandboxId: string;
  fpId: string;
  phoneNumber: string;
  authToken: string;
  obConfig: typeof obConfig;
  challengeData: unknown;
  updateContext?: (updates: Partial<AppContextState>) => void;
};

export const AppContext = createContext<AppContextState>({
  sandboxId: '',
  fpId: '',
  phoneNumber: '',
  authToken: '',
  obConfig,
  challengeData: null,
});

function App() {
  const [step, setStep] = useState('intro');
  const [contextState, setContextState] = useState(() => ({
    sandboxId,
    fpId: '',
    phoneNumber: '',
    authToken: '',
    obConfig,
    challengeData: null,
  }));

  const updateContext = useCallback(updates => {
    setContextState(prevState => ({ ...prevState, ...updates }));
  }, []);

  const contextValue = {
    ...contextState,
    updateContext,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={contextValue}>
        <div className="App">
          {step === 'intro' && (
            <IntroStep
              onFillout={phoneNumber => {
                updateContext({ phoneNumber });
                setStep('onboarding');
              }}
            />
          )}
          {step === 'waiting' && (
            <WaitingStep
              onSuccess={() => {
                setStep('success');
              }}
            />
          )}
          {step === 'onboarding' && (
            <OnboardingStep
              onSuccess={() => {
                setStep('success');
              }}
            />
          )}
          {step === 'success' && <SuccessStep />}
        </div>
      </AppContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
