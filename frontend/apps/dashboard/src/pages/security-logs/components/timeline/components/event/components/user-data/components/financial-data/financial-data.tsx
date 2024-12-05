import { IcoCreditcard16 } from '@onefootprint/icons';
import { useTranslation } from 'react-i18next';
import BaseHoverCard from '../../../base-hover-card';
import type { FinancialDataItem } from '../../types';
import FinancialDataDetails from '../financial-data-details/financial-data-details';

type FinancialDataProps = {
  cards: FinancialDataItem[];
  bankAccounts: FinancialDataItem[];
  hasNonFinancialFields: boolean;
};

const FinancialData = ({ cards, bankAccounts, hasNonFinancialFields }: FinancialDataProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });
  const getTriggerText = () => {
    return `${t('financial-data')}${hasNonFinancialFields ? ',' : ''}`;
  };
  return (
    <BaseHoverCard textTrigger={getTriggerText()} titleIcon={IcoCreditcard16} titleText={t('financial-data')}>
      <FinancialDataDetails cards={cards} bankAccounts={bankAccounts} />
    </BaseHoverCard>
  );
};

export default FinancialData;
