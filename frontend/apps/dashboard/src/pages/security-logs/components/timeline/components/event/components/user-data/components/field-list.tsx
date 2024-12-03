import type { CollectedDataOption, DataIdentifier } from '@onefootprint/request-types/dashboard';
import { Text, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import FinancialData from '../components/financial-data';
import FirstFieldsText from '../components/first-fields';
import getFinancialData from '../utils/get-financial-data';

const DEFAULT_NUM_VISIBLE_FIELDS = 3;

type FieldListProps = {
  fields: DataIdentifier[];
  cdos?: CollectedDataOption[];
  numVisibleFields?: number;
};

const FieldList = ({ fields, cdos = [], numVisibleFields = DEFAULT_NUM_VISIBLE_FIELDS }: FieldListProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });
  const { t: diT } = useTranslation('common', { keyPrefix: 'di' });
  const { t: cdoT } = useTranslation('common', { keyPrefix: 'cdo' });

  const translateDi = (di: DataIdentifier) => {
    if (di.startsWith('custom.')) return di;
    if (di.startsWith('business.beneficial_owners.')) return diT('business.beneficial_owners');
    // @ts-expect-error: Display undocumented DI as "Beneficial owners"
    if (di === 'business.beneficial_owner_explanation_message') return diT('business.beneficial_owners');
    return diT(di as DataIdentifier);
  };

  const { cards, bankAccounts, nonFinancialFields, hasFinancialData } = getFinancialData(fields);

  // TODO sort fields?
  const allNonFinancialFieldsTranslated = [
    ...nonFinancialFields.map(field => translateDi(field as DataIdentifier)),
    ...cdos.map(c => cdoT(c)),
  ];
  const visibleFields = allNonFinancialFieldsTranslated.slice(0, numVisibleFields);
  const collapsedFields = allNonFinancialFieldsTranslated.slice(numVisibleFields);
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
