enum OnboardingStatus {
  verified = 'pass',
  manualReview = 'manual_review',
  failed = 'fail',
  vaultOnly = 'vault-only', // Doesn't actually exist on the backend
}

export default OnboardingStatus;
