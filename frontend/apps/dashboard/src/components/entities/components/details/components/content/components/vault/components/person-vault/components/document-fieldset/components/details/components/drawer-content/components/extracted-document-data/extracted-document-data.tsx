import { IcoFileText24 } from '@onefootprint/icons';
import type { EntityVault, SupportedIdDocTypes } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import getRelevantKeys from '../../../../../../utils/get-relevant-keys';
import CollapsibleSection from '../collapsible-section';
import useDataLabelText from './hooks/use-data-label-text';
import getDataValue from './utils/get-data-value';

export type ExtractedDocumentDataProps = {
  vault: EntityVault;
  documentType: SupportedIdDocTypes;
  activeDocumentVersion: string;
};

const ExtractedDocumentData = ({ vault, documentType, activeDocumentVersion }: ExtractedDocumentDataProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset.documents.details.ocr',
  });
  const dataLabelT = useDataLabelText();
  const relevantKeys = getRelevantKeys({
    vault,
    documentType,
    currentDocumentNumber: activeDocumentVersion,
  });

  if (relevantKeys.length === 0) return null;

  return (
    <CollapsibleSection icon={IcoFileText24} title={t('title')} defaultOpen={true}>
      <Stack direction="column" gap={3} width="100%">
        {relevantKeys.sort().map(key => {
          const vaultValue = vault[key];
          const value = getDataValue(vaultValue, key, activeDocumentVersion);
          return (
            <Stack key={key} justify="space-between" gap={7}>
              <Text variant="body-3" color="tertiary" tag="label">
                {dataLabelT(key, activeDocumentVersion)}
              </Text>
              <Text variant="body-3" color="primary" textAlign="right" truncate title={value}>
                {value}
              </Text>
            </Stack>
          );
        })}
      </Stack>
    </CollapsibleSection>
  );
};

export default ExtractedDocumentData;
