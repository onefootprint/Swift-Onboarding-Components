enum OnboardingStatus {
  new = 'verified',
  verified = 'verified',
  manualReview = 'manual_review',
  stepUpRequired = 'step_up_required',
  processing = 'processing',
  failed = 'failed',
  vaultOnly = 'vault-only',
}

export default OnboardingStatus;
