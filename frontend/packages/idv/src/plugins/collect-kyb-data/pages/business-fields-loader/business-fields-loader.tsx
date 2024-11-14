import { type BusinessDIData, CollectedKybDataOption } from '@onefootprint/types';
import type React from 'react';
import useEffectOnceStrict from '../../../../components/identify/hooks/use-effect-once-strict';
import { useDecryptBusiness } from '../../../../queries';
import { useCollectKybDataMachine } from '../../components/machine-provider';
import { BusinessFields } from '../../utils/constants';
import { omitNullAndUndefined } from '../../utils/utils';

type BusinessFieldsLoaderProps = {
  children: React.ReactNode;
  onError: (error?: unknown) => void;
  onSuccess: (payload: BusinessDIData) => void;
};

const BusinessFieldsLoader = ({ children, onError, onSuccess }: BusinessFieldsLoaderProps) => {
  const mutDecryptBusiness = useDecryptBusiness();
  const [state, _] = useCollectKybDataMachine();
  const {
    idvContext: { authToken },
    kybRequirement,
  } = state.context;

  useEffectOnceStrict(() => {
    if (!authToken) {
      return;
    }
    mutDecryptBusiness
      .mutateAsync({ authToken, fields: BusinessFields })
      .then(businessData => {
        const payload = omitNullAndUndefined(businessData);
        if (kybRequirement.populatedAttributes?.includes(CollectedKybDataOption.tin)) {
          payload['business.tin'] = 'scrubbed';
        }

        return onSuccess(payload);
      })
      .catch(onError);
  });

  return children;
};

export default BusinessFieldsLoader;
