import { useEffectOnce } from 'usehooks-ts';

import { useIdentifyMachine } from '../../../components/identify-machine-provider';
import parseSuffix from '../utils/parse-suffix';

const useSkipIfHasBootstrapData = () => {
  const [state, send] = useIdentifyMachine();

  // TODO won't be able to do this anymore
  useEffectOnce(() => {
    const { bootstrapData } = state.context;
    const sandboxId = parseSuffix(bootstrapData?.email);
    if (sandboxId) {
      send({
        type: 'sandboxOutcomeSubmitted',
        payload: {
          sandboxId: `${sandboxId}`,
        },
      });
    }
  });
};

export default useSkipIfHasBootstrapData;
