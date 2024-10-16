import type { GetEntitySentilinkSignalResponse } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Score from './components/score';

type ContentProps = {
  data: GetEntitySentilinkSignalResponse;
};

const Content = ({ data }: ContentProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'risk-signals.sentilink.details' });
  const { idTheft, synthetic } = data;

  return (
    <Stack direction="column" gap={5}>
      {synthetic && (
        <Score score={synthetic.score} reasonCodes={synthetic.reasonCodes} title={t('score.synthetic-title')} />
      )}
      {idTheft && <Score score={idTheft.score} reasonCodes={idTheft.reasonCodes} title={t('score.id-theft-title')} />}
    </Stack>
  );
};

export default Content;
