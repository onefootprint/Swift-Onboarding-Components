import { StateValue } from 'xstate';

const getFormIdForState = (value: StateValue) => {
  if (value === 'name') {
    return 'name-form';
  }
  if (value === 'type') {
    return 'type-form';
  }
  if (value === 'kycCollect' || value === 'kybBoCollect') {
    return 'kyc-collect-form';
  }
  if (value === 'kycInvestorProfile') {
    return 'kyc-investor-profile-form';
  }
  if (value === 'kycAccess') {
    return 'kyc-access-form';
  }
  if (value === 'kybCollect') {
    return 'kyb-collect-form';
  }
  if (value === 'kybAccess') {
    return 'kyb-access-form';
  }
  return 'form';
};

export default getFormIdForState;
