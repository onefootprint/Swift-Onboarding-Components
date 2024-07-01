import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import { getLogger } from '../../../../../../utils/logger';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import getAllKycAttributes from '../../../../utils/all-attributes/all-attributes';
import type { KycData } from '../../../../utils/data-types';
import updateDataValue from '../../../../utils/update-data-value';
import type { FormData } from '../../types';

const { logError } = getLogger({ location: 'ssn-use-convert-form-data' });

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const attributes = getAllKycAttributes(requirement);
  const requiresSsn9 = attributes.includes(CollectedKycDataOption.ssn9);
  const requiresUsTaxId = attributes.includes(CollectedKycDataOption.usTaxId);

  return (formData: FormData, isSkipped?: boolean) => {
    const output: KycData = {};
    const { ssn4, ssn9, usTaxId } = formData;

    if (isSkipped) {
      if (!!output[IdDI.ssn9]?.value || !!output[IdDI.ssn4]?.value) {
        // TODO this is a bug... we won't actually send the empty SSN to the backend even though
        // the user is skipping SSN collection. It's a little hard to fix.
        // More context in https://github.com/onefootprint/monorepo/pull/9091
        logError('User skipped SSN collection, but SSN is present.');
      }
      output[IdDI.ssn9] = updateDataValue('', data[IdDI.ssn9]);
      output[IdDI.ssn4] = updateDataValue('', data[IdDI.ssn4]);
    } else if (requiresUsTaxId && usTaxId) {
      output[IdDI.usTaxId] = updateDataValue(usTaxId, data[IdDI.usTaxId]);
    } else if (requiresSsn9 && ssn9) {
      /** Only one of ssn4 vs ssn9 will be present */
      output[IdDI.ssn9] = updateDataValue(ssn9, data[IdDI.ssn9]);
    } else if (ssn4) {
      output[IdDI.ssn4] = updateDataValue(ssn4, data[IdDI.ssn4]);
    }

    return output;
  };
};

export default useConvertFormData;
