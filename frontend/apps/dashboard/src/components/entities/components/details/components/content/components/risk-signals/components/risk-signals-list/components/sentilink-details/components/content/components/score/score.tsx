import type { SentilinkReasonCode } from '@onefootprint/types';
import { Divider, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import ReasonCode from './components/reason-code';
import sortReasonCodes from './utils/sort-reason-codes';

type ScoreProps = {
  score: number;
  reasonCodes: SentilinkReasonCode[];
  title: string;
};

const Score = ({ score, reasonCodes, title }: ScoreProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'risk-signals.sentilink.details.score' });
  const sortedReasonCodes = sortReasonCodes(reasonCodes);

  return (
    <Stack direction="column" borderColor="tertiary" borderWidth={1} borderRadius="default" borderStyle="solid">
      <Stack
        direction="column"
        paddingInline={5}
        paddingBlock={4}
        borderBottomWidth={1}
        borderColor="tertiary"
        borderStyle="solid"
      >
        <Text variant="label-1" color="secondary">
          {title}
        </Text>
        <Text variant="heading-1" color={score >= 500 ? 'error' : 'success'}>
          {score}
        </Text>
      </Stack>
      <Stack direction="column" padding={5} gap={4}>
        <Stack direction="column" gap={3}>
          <Text variant="label-3">{t('detected-reason-codes')}</Text>
          <Divider variant="secondary" />
        </Stack>
        <Stack direction="column" gap={5}>
          {sortedReasonCodes.map(reasonCode => (
            <ReasonCode key={reasonCode.code} reasonCode={reasonCode} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Score;
