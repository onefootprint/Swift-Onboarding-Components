import { IcoFileText24 } from '@onefootprint/icons';
import type { DocumentDI, EntityVault, SupportedIdDocTypes } from '@onefootprint/types';
import { isVaultDataText } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import useDataLabelText from './hooks/use-data-label-text';
import getRelevantKeys from './utils/get-relevant-keys';

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

  const getVaultValueString = (key: DocumentDI) => {
    const vaultValue = vault[key];
    const valueString = isVaultDataText(vaultValue) ? vaultValue : JSON.stringify(vaultValue);
    return valueString ? valueString : '-';
  };

  return relevantKeys.length ? (
    <Stack direction="column" gap={5} align="flex-start">
      <Stack gap={2} align="center" justify="flex-start">
        <IcoFileText24 />
        <Text variant="label-2">{t('title')}</Text>
      </Stack>
      <Stack direction="column" gap={3} width="100%">
        {relevantKeys.sort().map(key => (
          <Stack key={key} justify="space-between" flexWrap="wrap">
            <Text variant="body-3" color="tertiary" tag="label">
              {dataLabelT(key, activeDocumentVersion)}
            </Text>
            <Text variant="body-3" color="primary" textAlign="right" truncate>
              {getVaultValueString(key)}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  ) : null;
};

export default ExtractedDocumentData;
