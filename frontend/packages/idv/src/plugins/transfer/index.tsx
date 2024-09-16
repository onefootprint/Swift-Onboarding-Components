import checkIsSocialMediaBrowser from '../../utils/check-is-social-media-browser';
import { TransferMachineProvider } from './components/machine-provider.tsx';
import Router from './pages/router';
import type { TransferProps } from './types';

const AppWithMachine = ({ idvContext, context, onDone }: TransferProps) => {
  const { device, authToken, isInIframe } = idvContext;
  const {
    config,
    missingRequirements = { documents: [] },
    idDocOutcome,
    isTransferFromDesktopToMobileDisabled,
  } = context;

  return (
    <TransferMachineProvider
      initialContext={{
        device,
        authToken,
        missingRequirements,
        config,
        idDocOutcome,
        scopedAuthToken: '',
        isSocialMediaBrowser: checkIsSocialMediaBrowser(),
        isInIframe: !!isInIframe,
        isTransferFromDesktopToMobileDisabled,
      }}
    >
      <Router onDone={onDone} />
    </TransferMachineProvider>
  );
};

export default AppWithMachine;
