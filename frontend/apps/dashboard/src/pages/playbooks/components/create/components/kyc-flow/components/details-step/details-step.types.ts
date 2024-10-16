import type { AdditionalDocsFormData } from '../../../additional-docs';
import type { GovDocsFormData } from '../../../gov-docs';
import type { InvestorFormData } from '../../../investor';
import type { PersonFormData } from '../person';

export type DetailsFormData = PersonFormData & AdditionalDocsFormData & GovDocsFormData & InvestorFormData;
