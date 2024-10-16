import type { DialogButton } from '@onefootprint/ui';
import { createContext, useContext, useState } from 'react';

type DialogButtonsContextType = {
  primaryButton: DialogButton;
  secondaryButton?: DialogButton;
  setPrimaryButton: (button: DialogButton) => void;
  showBackButton: () => void;
  hideBackButton: () => void;
  reset: () => void;
  setBusy: (isBusy: boolean) => void;
};

const initialPrimaryButton: DialogButton = {
  label: 'Continue',
  type: 'submit',
  form: 'playbook-form',
};

const DialogButtonsContext = createContext<DialogButtonsContextType | undefined>(undefined);

export const DialogButtonsProvider = ({ children }: { children: React.ReactNode }) => {
  const [primaryButton, setPrimaryButton] = useState<DialogButton>(initialPrimaryButton);
  const [secondaryButton, setSecondaryButton] = useState<DialogButton | undefined>();

  const reset = () => {
    setPrimaryButton(initialPrimaryButton);
    setSecondaryButton(undefined);
  };

  const hideBackButton = () => setSecondaryButton(undefined);

  const showBackButton = () => {
    setSecondaryButton({ label: 'Back', type: 'reset', form: 'playbook-form' });
  };

  const setBusy = (isBusy: boolean) => {
    setPrimaryButton(prevButton => ({ ...prevButton, loading: isBusy }));
    setSecondaryButton(prevButton => prevButton && { ...prevButton, disabled: isBusy });
  };

  return (
    <DialogButtonsContext.Provider
      value={{
        primaryButton,
        secondaryButton,
        setPrimaryButton,
        showBackButton,
        hideBackButton,
        reset,
        setBusy,
      }}
    >
      {children}
    </DialogButtonsContext.Provider>
  );
};

export const useDialogButtons = () => {
  const context = useContext(DialogButtonsContext);
  if (!context) {
    throw new Error('useDialogButtons must be used within a DialogButtonsProvider');
  }
  return context;
};
