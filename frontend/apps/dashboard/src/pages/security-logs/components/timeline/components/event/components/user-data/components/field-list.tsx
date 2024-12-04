import type { CollectedDataOption, DataIdentifier } from '@onefootprint/request-types/dashboard';
import { Text, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import FinancialData from '../components/financial-data';
import FirstFieldsText from '../components/first-fields';
import getFinancialData from '../utils/get-financial-data';
import useTranslateAndSortFields from './hooks/use-translate-and-sort-fields';

const DEFAULT_NUM_VISIBLE_FIELDS = 3;

type FieldListProps = {
  fields: DataIdentifier[];
  cdos?: CollectedDataOption[];
  numVisibleFields?: number;
};

const FieldList = ({ fields, cdos = [], numVisibleFields = DEFAULT_NUM_VISIBLE_FIELDS }: FieldListProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });

  const { cards, bankAccounts, nonFinancialFields, hasFinancialData } = getFinancialData(fields);

  const allNonFinancialFields = useTranslateAndSortFields(nonFinancialFields, cdos);
  const visibleFields = allNonFinancialFields.slice(0, numVisibleFields);
  const collapsedFields = allNonFinancialFields.slice(numVisibleFields);
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
