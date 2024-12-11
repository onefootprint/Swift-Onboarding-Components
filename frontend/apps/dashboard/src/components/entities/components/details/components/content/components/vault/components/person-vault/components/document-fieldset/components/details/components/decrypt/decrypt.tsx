import { useTranslation } from 'react-i18next';

import { LinkButton, Stack, Text, Tooltip } from '@onefootprint/ui';

type DecryptProps = {
  isDecryptable: boolean;
  onClick: () => void;
};

const Decrypt = ({ isDecryptable, onClick }: DecryptProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset.documents.details.decrypt' });

  return (
    <Stack align="center" gap={2} height="fit-content" padding={7}>
      <Text variant="body-3">{t('message-start')}</Text>
      <Tooltip disabled={isDecryptable} text={t('not-allowed')} position="bottom" asChild>
        <LinkButton disabled={!isDecryptable} onClick={onClick}>
          {t('decrypt-cta')}
        </LinkButton>
      </Tooltip>
      <Text variant="body-3">{t('message-end')}</Text>
    </Stack>
  );
};

export default Decrypt;
