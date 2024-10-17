import type { AdditionalDocsFormData } from '../../../additional-docs';
import type { GovDocsFormData } from '../../../gov-docs';
import type { BoBasicFormData } from './components/bo-basic-data';

export type BoFormData = BoBasicFormData & AdditionalDocsFormData & GovDocsFormData;
