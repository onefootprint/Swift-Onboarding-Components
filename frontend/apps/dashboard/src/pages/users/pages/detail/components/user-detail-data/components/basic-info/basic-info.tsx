import React from 'react';
import { User } from 'src/pages/users/hooks/use-join-users';
import { UserDataAttribute } from 'types';
import { useUpdateEffect } from 'usehooks-ts';

import { useDecryptMachine } from '../../../../utils/decrypt-state-machine';
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
    state.matches('SELECTING_FIELDS') ||
    state.matches('CONFIRMING_REASON') ||
    state.matches('DECRYPTING');

  useUpdateEffect(() => {
    if (state.matches('DECRYPTING')) {
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
