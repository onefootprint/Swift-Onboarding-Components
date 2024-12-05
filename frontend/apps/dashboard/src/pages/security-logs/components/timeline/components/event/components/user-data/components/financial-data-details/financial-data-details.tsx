import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import type { FinancialDataItem } from '../../types';
import FinancialPermissions from './components/financial-permissions/financial-permissions';

const FinancialDataDetails = ({
  cards,
  bankAccounts,
}: { cards: FinancialDataItem[]; bankAccounts: FinancialDataItem[] }) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });
  return (
    <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
      {cards.map(card => (
        <FinancialPermissions key={_.uniqueId()} title={`${card.name} (${t('card')})`} permissions={card.fields} />
      ))}
      {bankAccounts.map(bankAccount => (
        <FinancialPermissions
          key={_.uniqueId()}
          title={`${bankAccount.name} (${t('bank-account')})`}
          permissions={bankAccount.fields}
        />
      ))}
    </div>
  );
};

export default FinancialDataDetails;
