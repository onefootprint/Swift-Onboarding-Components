import { MachineProvider } from './components/machine-provider';
import Router from './pages/router';
import type { CollectKycDataProps } from './types';
import getInitData from './utils/get-init-data';

const CollectKycData = ({ idvContext, context, onDone }: CollectKycDataProps) => {
  const { authToken, device } = idvContext;
  const { config, requirement, bootstrapUserData } = context;
  const initData = getInitData(requirement, bootstrapUserData);

  const initContext = {
    authToken,
    device,
    config,
    requirement,
    data: initData,
    initialData: {},
  };

  return (
    <MachineProvider initialContext={initContext}>
      <Router onDone={onDone} />
    </MachineProvider>
  );
};

export default CollectKycData;
