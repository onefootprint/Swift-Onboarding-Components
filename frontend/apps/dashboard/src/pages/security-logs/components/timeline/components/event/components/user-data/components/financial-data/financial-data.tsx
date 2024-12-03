import { Stack, Text } from '@onefootprint/ui';
import * as HoverCard from '@radix-ui/react-hover-card';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import type { FinancialDataItem } from '../../types';
import FinancialDataDetails from '../financial-data-details/financial-data-details';

type FinancialDataProps = {
  cards: FinancialDataItem[];
  bankAccounts: FinancialDataItem[];
  hasNonFinancialFields: boolean;
};

const FinancialData = ({ cards, bankAccounts, hasNonFinancialFields }: FinancialDataProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });

  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <Stack gap={2} cursor="default">
        <HoverCard.Trigger asChild>
          <Text variant="label-3" textDecoration="underline">
            {t('financial-data')}
            {hasNonFinancialFields && ','}
          </Text>
        </HoverCard.Trigger>
      </Stack>

      <HoverCard.Portal>
        <HoverCardContent side="bottom" sideOffset={5} align="start">
          <FinancialDataDetails cards={cards} bankAccounts={bankAccounts} />
        </HoverCardContent>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const HoverCardContent = styled(HoverCard.Content)`
  will-change: opacity;
  transform-origin: var(--radix-hover-card-content-transform-origin);
  animation: ${scaleIn} 0.1s ease-out;
`;

export default FinancialData;
