import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { useEffectOnce } from 'usehooks-ts';

import parseSuffix from '../utils/parse-suffix';

const useSkipIfHasBootstrapData = () => {
  const [state, send] = useBifrostMachine();

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
