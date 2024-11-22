import { IcoCreditcard16 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import type { FinancialDataItem } from '../../types';
import FinancialPermissions from './components/financial-permissions/financial-permissions';

const FinancialDataDetails = ({
  cards,
  bankAccounts,
}: { cards: FinancialDataItem[]; bankAccounts: FinancialDataItem[] }) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });
  return (
    <ShadowStack
      backgroundColor="primary"
      padding={4}
      gap={5}
      direction="column"
      borderStyle="solid"
      borderRadius="default"
    >
      <Stack gap={2}>
        <IcoCreditcard16 />
        <Text variant="label-3">{t('financial-data')}</Text>
      </Stack>
      <ScrollableStack gap={4} direction="column">
        {cards.map(card => (
          <FinancialPermissions title={`${card.name} (${t('card')})`} permissions={card.fields} />
        ))}
        {bankAccounts.map(bankAccount => (
          <FinancialPermissions title={`${bankAccount.name} (${t('bank-account')})`} permissions={bankAccount.fields} />
        ))}
      </ScrollableStack>
    </ShadowStack>
  );
};

const ScrollableStack = styled(Stack)`
  max-height: 500px;
  overflow-y: auto;
`;

const ShadowStack = styled(Stack)`
    box-shadow: 0px 1px 8px 0px #00000024;
`;

export default FinancialDataDetails;
