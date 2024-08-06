import { MachineProvider } from './components/machine-provider';
import type { InvestorProfileProps } from './investor-profile.types';
import Router from './pages/router';

const InvestorProfile = ({ idvContext, context, onDone }: InvestorProfileProps) => {
  const { authToken, device } = idvContext;
  const initContext = {
    device,
    authToken,
    showTransition: context.showTransition,
  };

  return (
    <MachineProvider args={initContext}>
      <Router onDone={onDone} />
    </MachineProvider>
  );
};

export default InvestorProfile;
