import Logger from '../../../../../../utils/logger';
import type { IdentifyMachineArgs } from '../../machine';
import type { MachineContext } from '../../types';

const getSanitizedArgs = ({
  config,
  device,
  sandboxId,
  bootstrapData,
  initialAuthToken,
  overallOutcome,
  obConfigAuth,
  showLogo,
}: IdentifyMachineArgs): MachineContext => {
  if (!obConfigAuth && !initialAuthToken) {
    console.error(
      'Error initializing Identify machine: obConfigAuth must be provided if initialAuthToken is absent',
    );
    Logger.error(
      'Error initializing Identify machine: obConfigAuth must be provided if initialAuthToken is absent',
      'identify',
    );
  }
  return {
    config,
    device,
    obConfigAuth,
    bootstrapData: bootstrapData ?? {},
    identify: {
      sandboxId,
    },
    overallOutcome,
    challenge: {},
    showLogo,
    initialAuthToken,
  };
};

export default getSanitizedArgs;
