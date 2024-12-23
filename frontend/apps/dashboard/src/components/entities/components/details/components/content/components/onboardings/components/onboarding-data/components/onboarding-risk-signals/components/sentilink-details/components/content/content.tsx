import type { SentilinkDetail } from '@onefootprint/request-types/dashboard';
import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Score from './components/score';

type ContentProps = {
  data: SentilinkDetail;
};

const Content = ({ data }: ContentProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.risk-signals.drawer.sentilink.score' });
  const { idTheft, synthetic } = data;

  return (
    <Stack direction="column" gap={5}>
      {synthetic ? (
        <Score
          score={synthetic.score}
          scoreBand={synthetic.scoreBand}
          reasonCodes={synthetic.reasonCodes}
          title={t('synthetic-title')}
        />
      ) : null}
      {idTheft ? (
        <Score
          score={idTheft.score}
          scoreBand={idTheft.scoreBand}
          reasonCodes={idTheft.reasonCodes}
          title={t('id-theft-title')}
        />
      ) : null}
    </Stack>
  );
};

export default Content;
