import { useEffectOnce } from 'usehooks-ts';

import { useIdentifyMachine } from '../../../components/identify-machine-provider';
import parseSuffix from '../utils/parse-suffix';

const useSkipIfHasBootstrapData = () => {
  const [state, send] = useIdentifyMachine();

  useEffectOnce(() => {
    const { bootstrapData } = state.context;
    const sandboxSuffix = parseSuffix(bootstrapData?.email);
    if (sandboxSuffix) {
      send({
        type: 'sandboxOutcomeSubmitted',
        payload: {
          sandboxSuffix: `#${sandboxSuffix}`,
        },
      });
    }
  });
};

export default useSkipIfHasBootstrapData;
