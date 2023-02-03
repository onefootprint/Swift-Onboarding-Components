import getContextByPage from './get-context-by-page';

describe('getContextByPage', () => {
  it('should return "profile" when page is one onboarding requirement page', () => {
    expect(getContextByPage('kyc-data')).toBe('profile');
    expect(getContextByPage('id-doc')).toBe('profile');
    expect(getContextByPage('liveness')).toBe('profile');
  });

  it('should return "transaction" when page is authorize page', () => {
    expect(getContextByPage('authorize')).toBe('transaction');
  });
});
