import { useEffectOnce } from 'usehooks-ts';

import useIdvMachine from '../../../hooks/use-idv-machine';
import parseSuffix from '../utils/parse-suffix';

const useSkipIfHasBootstrapData = () => {
  const [state, send] = useIdvMachine();

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
