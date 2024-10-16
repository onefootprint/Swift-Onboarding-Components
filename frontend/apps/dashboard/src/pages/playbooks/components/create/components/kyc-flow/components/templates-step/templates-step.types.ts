export enum OnboardingTemplate {
  Custom = 'custom',
  Alpaca = 'alpaca',
  Apex = 'apex',
  TenantScreening = 'tenant-screening',
  CarRental = 'car-rental',
  CreditCard = 'credit-card',
}

export type TemplatesFormData = {
  template: OnboardingTemplate;
};
