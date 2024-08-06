import { IcoFileText24 } from '@onefootprint/icons';
import type { DocumentDI, EntityVault, SupportedIdDocTypes } from '@onefootprint/types';
import { isVaultDataText } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { getDataLabel, getRelevantKeys } from '../../../../utils';

export type ExtractedDocumentDataProps = {
  vault: EntityVault;
  documentType: SupportedIdDocTypes;
  activeDocumentVersion: string;
};

const ExtractedDocumentData = ({ vault, documentType, activeDocumentVersion }: ExtractedDocumentDataProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.document',
  });
  const relevantKeys = getRelevantKeys({
    vault,
    documentType,
    currentDocumentNumber: activeDocumentVersion,
  });

  const getVaultValueString = (key: DocumentDI) => {
    const vaultValue = vault[key];
    if (isVaultDataText(vaultValue)) {
      return vaultValue;
    }
    return JSON.stringify(vaultValue);
  };

  return relevantKeys.length ? (
    <Section>
      <LabelContainer>
        <IcoFileText24 />
        <Text variant="label-2">{t(`drawer.document-data.title` as ParseKeys<'common'>)}</Text>
      </LabelContainer>
      <DocumentDataFieldContainer>
        {relevantKeys.sort().map(key => (
          <DocumentDataField key={key}>
            <Text variant="body-3" color="tertiary" tag="label">
              {t(`drawer.document-data.labels.${getDataLabel(key, activeDocumentVersion)}` as ParseKeys<'common'>)}
            </Text>
            <Text variant="body-3" color="primary" textAlign="right">
              {getVaultValueString(key)}
            </Text>
          </DocumentDataField>
        ))}
      </DocumentDataFieldContainer>
    </Section>
  ) : null;
};

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  `};
`;

const Section = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[5]};
    flex-direction: column;
    align-items: flex-start;
  `};
`;

const DocumentDataField = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column wrap;
    justify-content: space-between;
    gap: ${theme.spacing[11]};
  `};
`;

const DocumentDataFieldContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    width: 100%;
  `}
`;

export default ExtractedDocumentData;
