import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import { User } from 'src/pages/users/hooks/use-join-users';
import { useUpdateEffect } from 'usehooks-ts';

import { State } from '../../../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../../../decrypt-machine-provider';
import DecryptBasicInfo from './components/decrypt-basic-info';
import ViewBasicInfo from './components/view-basic-info';

type BasicInfoProps = {
  user: User;
  onDecrypt: (
    fields: Partial<Record<UserDataAttribute, boolean>>,
    reason: string,
  ) => void;
};

const BasicInfo = ({ user, onDecrypt }: BasicInfoProps) => {
  const [state] = useDecryptMachine();
  const showCheckboxes =
    state.matches(State.selectingFields) ||
    state.matches(State.confirmingReason) ||
    state.matches(State.decrypting);

  useUpdateEffect(() => {
    if (state.matches(State.decrypting)) {
      onDecrypt(state.context.fields, state.context.reason);
    }
  }, [state.value]);

  return showCheckboxes ? (
    <DecryptBasicInfo user={user} />
  ) : (
    <ViewBasicInfo user={user} />
  );
};

export default BasicInfo;
