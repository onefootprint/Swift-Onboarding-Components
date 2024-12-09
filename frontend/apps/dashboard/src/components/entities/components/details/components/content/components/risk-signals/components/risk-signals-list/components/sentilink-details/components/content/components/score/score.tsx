import type { UIStates } from '@onefootprint/design-tokens';
import type { ScoreBand, SentilinkReasonCode } from '@onefootprint/request-types/dashboard';
import { Divider, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import ReasonCode from './components/reason-code';
import { sortReasonCodes } from './utils/sort-reason-codes/sort-reason-codes';

type ScoreProps = {
  score: number;
  scoreBand: ScoreBand;
  reasonCodes: SentilinkReasonCode[];
  title: string;
};

const scoreToColor: Record<ScoreBand, keyof UIStates> = {
  low: 'success',
  medium: 'warning',
  high: 'error',
};

const Score = ({ score, scoreBand, reasonCodes, title }: ScoreProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.risk-signals.drawer.sentilink.score' });
  const sortedReasonCodes = sortReasonCodes(reasonCodes);
  const scoreColor = scoreToColor[scoreBand];

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
        <Text variant="heading-1" color={scoreColor}>
          {score}
        </Text>
      </Stack>
      <Stack direction="column" padding={5} gap={4}>
        <Stack direction="column" gap={3}>
          <Text variant="label-3">{t('detected-reason-codes')}</Text>
          <Divider variant="secondary" />
        </Stack>
        <Stack direction="column" gap={5}>
          {sortedReasonCodes.map((reasonCode: SentilinkReasonCode) => (
            <ReasonCode key={reasonCode.code} reasonCode={reasonCode} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Score;
