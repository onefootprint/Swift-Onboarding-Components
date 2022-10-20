export type OnboardingDecision = {
  id: string;
  verificationStatus: string; // TODO enum
  complianceStatus: string; // TODO enum
  tenantUserId?: string;
  timestap: string;
};
