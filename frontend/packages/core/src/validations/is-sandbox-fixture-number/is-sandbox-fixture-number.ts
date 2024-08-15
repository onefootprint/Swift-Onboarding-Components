const isSandboxFixtureNumber = (phoneNumber: string) => {
  const SANDBOX_NUMBER = '+15555550100';
  const normalizedPhoneNumber = phoneNumber.replace(/[^+\d]/g, '');
  return normalizedPhoneNumber === SANDBOX_NUMBER;
};

export default isSandboxFixtureNumber;
