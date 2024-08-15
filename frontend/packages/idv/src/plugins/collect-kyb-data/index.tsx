import type { CollectKybDataProps } from './collect-kyb-data.types';
import { MachineProvider } from './components/machine-provider';
import Router from './pages/router';
import { getBusinessDataFromContext } from './utils/attributes';
import type { MachineContext } from './utils/state-machine';

const CollectKybData = ({ idvContext, context, onDone }: CollectKybDataProps) => {
  const { bootstrapBusinessData, bootstrapUserData, config, kybRequirement, kycRequirement } = context;
  const partialInitContext: MachineContext = {
    idvContext,
    config,
    kybRequirement,
    kycRequirement,
    bootstrapUserData,
    bootstrapBusinessData,
    data: {},
    dataCollectionScreensToShow: [],
  };

  const initContext = {
    ...partialInitContext,
    data: getBusinessDataFromContext(partialInitContext),
    vaultBusinessData: {},
  };

  return (
    <MachineProvider args={initContext}>
      <Router onDone={onDone} />
    </MachineProvider>
  );
};

export default CollectKybData;
