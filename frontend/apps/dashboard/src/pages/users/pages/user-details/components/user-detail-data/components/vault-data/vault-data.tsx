import { IdDocDataAttribute, UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import { User } from 'src/pages/users/types/user.types';
import getAttrListFromFields from 'src/utils/get-attr-list-from-fields';
import { useUpdateEffect } from 'usehooks-ts';

import { State } from '../../../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../../../decrypt-machine-provider';
import { DecryptVaultData, ViewVaultData } from './components';
import useRiskSignalsOverview from './hooks/use-risk-signals-overview';

type VaultDataProps = {
  user: User;
  onDecrypt: (
    kyc: UserDataAttribute[],
    idDoc: IdDocDataAttribute[],
    reason: string,
  ) => void;
};

const VaultData = ({ user, onDecrypt }: VaultDataProps) => {
  useRiskSignalsOverview();
  const [state] = useDecryptMachine();
  const { fields, reason } = state.context;
  const showForm =
    state.matches(State.selectingFields) ||
    state.matches(State.confirmingReason) ||
    state.matches(State.decrypting);

  useUpdateEffect(() => {
    if (state.matches(State.decrypting) && reason && fields) {
      // Get the attribute names with true values
      const { kycData, idDoc } = getAttrListFromFields(
        fields.kycData,
        fields.idDoc,
      );
      onDecrypt(kycData, idDoc, reason);
    }
  }, [state.value]);

  return showForm ? (
    <DecryptVaultData user={user} />
  ) : (
    <ViewVaultData user={user} />
  );
};

export default VaultData;
