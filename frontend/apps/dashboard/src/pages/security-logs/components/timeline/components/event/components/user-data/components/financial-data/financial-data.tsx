import { IcoCreditcard16 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import type { FinancialDataItem } from '../../types';
import FinancialPermissions from './components/financial-permissions/financial-permissions';

const FinancialData = ({ cards, bankAccounts }: { cards: FinancialDataItem[]; bankAccounts: FinancialDataItem[] }) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });
  return (
    <Stack backgroundColor="primary" padding={4} gap={5} direction="column">
      <Stack gap={2}>
        <IcoCreditcard16 />
        <Text variant="label-3">{t('financial-data')}</Text>
      </Stack>
      <Stack gap={4} direction="column">
        {cards.map(card => (
          <FinancialPermissions title={`${t('card')} ${card.name}`} permissions={card.fields} />
        ))}
        {bankAccounts.map(bankAccount => (
          <FinancialPermissions title={`${t('bank-account')} ${bankAccount.name}`} permissions={bankAccount.fields} />
        ))}
      </Stack>
    </Stack>
  );
};

export default FinancialData;
