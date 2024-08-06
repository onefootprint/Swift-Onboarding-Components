import { useTranslation } from 'react-i18next';

import { LinkButton, Stack, Text, Tooltip } from '@onefootprint/ui';
import { useDecryptControls } from '../../../vault/components/vault-actions';

type DecryptProps = {
  canDecrypt: boolean;
};

const Decrypt = ({ canDecrypt }: DecryptProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights.decrypt',
  });
  const decryptControls = useDecryptControls();

  const handleDecryptAll = () => {
    decryptControls.submitAllFields();
  };

  return (
    <Stack align="center" gap={2}>
      <Text variant="body-3">{t('message-start')}</Text>
      <Tooltip disabled={canDecrypt} text={t('not-allowed')}>
        <LinkButton disabled={!canDecrypt} onClick={handleDecryptAll}>
          {t('decrypt-all')}
        </LinkButton>
      </Tooltip>
      <Text variant="body-3">{t('message-end')}</Text>
    </Stack>
  );
};

export default Decrypt;
