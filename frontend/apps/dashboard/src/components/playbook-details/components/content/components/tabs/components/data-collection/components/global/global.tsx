import type { SupportedIdDocTypes } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useIdDocList from 'src/hooks/use-id-doc-list';

type GlobalProps = {
  global?: SupportedIdDocTypes[];
  hasSelfie?: boolean;
};

const Global = ({ global = [], hasSelfie = false }: GlobalProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection' });
  const getIdDocList = useIdDocList();
  const documentTypes = getIdDocList(global);

  return (
    <Stack gap={3} direction="column">
      <Text variant="label-2">{t('gov-docs.global.scans')}</Text>
      {documentTypes.length === 0 ? (
        <Text variant="body-2" color="secondary">
          {t('gov-docs.none')}
        </Text>
      ) : (
        <Text variant="body-2" tag="span">
          <Stack direction="row" gap={3}>
            <Text variant="body-2" tag="span" color="secondary">
              {documentTypes.join(', ')}
            </Text>
            {hasSelfie && (
              <>
                <Text variant="body-2" color="primary" tag="span">
                  +
                </Text>
                <Text variant="body-2" color="secondary" tag="span">
                  {t('gov-docs.selfie')}
                </Text>
              </>
            )}
          </Stack>
        </Text>
      )}
    </Stack>
  );
};

export default Global;
