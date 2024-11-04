import { useEffect } from 'react';

import { getLogger, trackAction } from '@/idv/utils';
import { useLogStateMachine } from '../../../../hooks';
import Loading from '../../components/loading';
import { useCollectKybDataMachine } from '../../components/machine-provider';
import BasicData from '../basic-data';
import BeneficialOwnerKyc from '../beneficial-owner-kyc';
import BusinessAddress from '../business-address';
import BusinessFieldsLoader from '../business-fields-loader';
import Confirm from '../confirm';
import ManageBos from '../manage-bos';

type RouterProps = { onDone: () => void };

const { logError } = getLogger({ location: 'collect-kyb-data-router' });

const Router = ({ onDone }: RouterProps) => {
  const [state, send] = useCollectKybDataMachine();
  const isDone = state.matches('completed');
  useLogStateMachine('collect-kyb-data', state);

  useEffect(() => {
    trackAction('kyb:started');
  }, []);

  useEffect(() => {
    if (isDone) {
      onDone();
      trackAction('kyb:completed');
    }
  }, [isDone, onDone]);

  if (state.matches('loadFromVault')) {
    return (
      <BusinessFieldsLoader
        onSuccess={payload => send({ type: 'businessDataLoadSuccess', payload })}
        onError={err => {
          logError('error fetching business.* and id.*', err);
          send({ type: 'businessDataLoadError' });
        }}
      >
        <Loading />
      </BusinessFieldsLoader>
    );
  }
  if (state.matches('basicData')) {
    return <BasicData />;
  }
  if (state.matches('businessAddress')) {
    return <BusinessAddress />;
  }
  if (state.matches('manageBos')) {
    return <ManageBos />;
  }
  if (state.matches('confirm')) {
    return <Confirm />;
  }
  if (state.matches('beneficialOwnerKyc')) {
    return <BeneficialOwnerKyc />;
  }

  return null;
};

export default Router;
