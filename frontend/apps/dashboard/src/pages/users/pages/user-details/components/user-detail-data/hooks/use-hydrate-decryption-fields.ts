import { IdDocType, UserDataAttribute } from '@onefootprint/types';
import {
  IdDocDataValue,
  KycDataValue,
  UserVaultData,
} from 'src/pages/users/users.types';
import { useEffectOnce } from 'usehooks-ts';

import { Event } from '../../../utils/decrypt-state-machine';
import { Fields } from '../../../utils/decrypt-state-machine/types';
import { useDecryptMachine } from '../../decrypt-machine-provider';

const useHydrateDecryptionFields = (vaultData: UserVaultData) => {
  const [, send] = useDecryptMachine();

  const hydrateFields = () => {
    const { kycData, idDoc } = vaultData;
    const fields: Fields = {
      kycData: {},
      idDoc: {},
    };
    if (kycData) {
      Object.entries(kycData).forEach(entry => {
        const attr = entry[0] as UserDataAttribute;
        const value = entry[1] as KycDataValue;
        if (value !== null) {
          fields.kycData[attr] = true;
        }
      });
    }
    if (idDoc) {
      Object.entries(idDoc).forEach(entry => {
        const attr = entry[0] as IdDocType;
        const value = entry[1] as IdDocDataValue;
        if (value !== null) {
          fields.idDoc[attr] = true;
        }
      });
    }
    const hasData =
      Object.keys(fields.kycData).length > 0 ||
      Object.keys(fields.idDoc).length > 0;
    if (hasData) {
      send({ type: Event.hydrated, payload: { fields } });
    }
  };

  useEffectOnce(hydrateFields);
};
export default useHydrateDecryptionFields;
