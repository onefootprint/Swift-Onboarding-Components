import type { SupportedIdDocTypes } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useIdDocText from 'src/hooks/use-id-doc-text';

type GlobalProps = {
  global?: SupportedIdDocTypes[];
  hasSelfie?: boolean;
};

const Global = ({ global = [], hasSelfie = false }: GlobalProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection' });
  const idDocText = useIdDocText();

  const documentTypes = global.map(key => idDocText(key));
  const displayText = documentTypes.join(', ') + (hasSelfie ? ` + ${t('gov-docs.selfie')}` : '');

  return (
    <Stack gap={3} direction="column">
      <Text variant="label-3">{t('gov-docs.global.scans')}</Text>
      <Text paddingLeft={3} variant="body-3" color="secondary">
        {documentTypes.length === 0 ? t('gov-docs.none') : displayText}
      </Text>
    </Stack>
  );
};

export default Global;
