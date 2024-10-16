import type { AdditionalDocsFormData } from '../additional-docs';
import type { KycPersonFormData } from '../collect-kyc-person';
import type { GovDocsFormData } from '../gov-docs';
import type { InvestorFormData } from '../investor';

export type KycFormData = KycPersonFormData & AdditionalDocsFormData & GovDocsFormData & InvestorFormData;
