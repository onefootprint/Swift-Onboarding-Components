import type { BusinessDIData } from './business-di-data';
import type { IdDIData } from './id-di-data';

// TODO: expand in the future with KybBootstrapData and InvestorProfileBootstrapData
export type IdvBootstrapData = IdDIData & BusinessDIData;

export type IdvOptions = {
  showCompletionPage?: boolean;
  showLogo?: boolean;
};

export type KycBootstrapData = IdDIData;
