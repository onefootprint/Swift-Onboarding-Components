import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { Text, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import FinancialData from '../components/financial-data';
import FirstFieldsText from '../components/first-fields';
import { MAX_VISIBLE_FIELDS } from '../constants';
import getFinancialData from '../utils/get-financial-data';

type FieldListProps = {
  fields: DataIdentifier[];
};

/** Renders the list of fields and CDOs. If CDOs are provided, will prefer to render a CDO rather than its constituent DI fields, but will still render DIs that don't belong to any provided CDO. */
const FieldList = ({ fields }: FieldListProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });
  const { t: allT } = useTranslation('common', { keyPrefix: 'di' });

  const { cards, bankAccounts, nonFinancialFields, hasFinancialData } = getFinancialData(fields);
  const showTooltip = nonFinancialFields.length > MAX_VISIBLE_FIELDS;
  const numRemainingFields = nonFinancialFields.length - MAX_VISIBLE_FIELDS;
  const remainingFieldsTranslated = nonFinancialFields
    .slice(MAX_VISIBLE_FIELDS)
    .map(field => allT(field as DataIdentifier))
    .join('; ');

  return (
    <>
      {hasFinancialData && (
        <FinancialData cards={cards} bankAccounts={bankAccounts} nonFinancialFields={nonFinancialFields} />
      )}
      {nonFinancialFields.length > 0 && <FirstFieldsText fields={nonFinancialFields} />}
      {showTooltip && (
        <Tooltip text={remainingFieldsTranslated} position="bottom">
          <Text variant="label-3" tag="span" textDecoration="underline" cursor="default">
            {numRemainingFields} {numRemainingFields === 1 ? t('other-attribute') : t('other-attributes')}
          </Text>
        </Tooltip>
      )}
    </>
  );
};

export default FieldList;
