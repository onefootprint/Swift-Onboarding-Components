import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { Text, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import FinancialData from '../components/financial-data';
import FirstFieldsText from '../components/first-fields';
import getFinancialData from '../utils/get-financial-data';

const DEFAULT_NUM_VISIBLE_FIELDS = 3;

type FieldListProps = {
  fields: DataIdentifier[];
  numVisibleFields?: number;
};

/** Renders the list of fields and CDOs. If CDOs are provided, will prefer to render a CDO rather than its constituent DI fields, but will still render DIs that don't belong to any provided CDO. */
const FieldList = ({ fields, numVisibleFields = DEFAULT_NUM_VISIBLE_FIELDS }: FieldListProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });
  const { t: diT } = useTranslation('common', { keyPrefix: 'di' });

  const { cards, bankAccounts, nonFinancialFields, hasFinancialData } = getFinancialData(fields);

  const allNonFinancialsFieldsTranslated = nonFinancialFields.map(field => diT(field));
  const visibleFields = allNonFinancialsFieldsTranslated.slice(0, numVisibleFields);
  const collapsedFields = allNonFinancialsFieldsTranslated.slice(numVisibleFields);
  const collapsedFieldsStr = collapsedFields.join('; ');

  return (
    <>
      {hasFinancialData && (
        <FinancialData cards={cards} bankAccounts={bankAccounts} hasNonFinancialFields={!!visibleFields.length} />
      )}
      <FirstFieldsText fields={visibleFields} hasCollapsedFields={collapsedFields.length > 0} />
      {collapsedFields.length ? (
        <Tooltip text={collapsedFieldsStr} position="bottom">
          <Text variant="label-3" tag="span" textDecoration="underline" cursor="default">
            {collapsedFields.length} {collapsedFields.length === 1 ? t('other-attribute') : t('other-attributes')}
          </Text>
        </Tooltip>
      ) : null}
    </>
  );
};

export default FieldList;
