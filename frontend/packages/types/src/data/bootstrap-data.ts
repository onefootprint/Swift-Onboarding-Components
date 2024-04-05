import type { IdDIData } from './id-di-data';

// TODO: expand in the future with KybBootstrapData and InvestorProfileBootstrapData
export type IdvBootstrapData = KycBootstrapData;

export type IdvOptions = {
  showCompletionPage?: boolean;
  showLogo?: boolean;
};

export type KycBootstrapData = IdDIData;
