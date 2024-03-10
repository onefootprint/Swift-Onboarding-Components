import type { KycData } from '../../../data-types';

const mergeUpdatedData = (data: KycData, newData: KycData): KycData => ({
  ...data,
  ...newData,
});

export default mergeUpdatedData;
