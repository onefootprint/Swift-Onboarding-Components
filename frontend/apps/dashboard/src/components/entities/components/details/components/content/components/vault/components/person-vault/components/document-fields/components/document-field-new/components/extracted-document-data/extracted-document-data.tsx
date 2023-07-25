import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  DocumentDI,
  EntityVault,
  isVaultDataText,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import { getDataLabel, getRelevantKeys } from '../../../../utils';

export type ExtractedDocumentDataProps = {
  vault: EntityVault;
  documentType: SupportedIdDocTypes;
  activeDocumentVersion: string;
};

const ExtractedDocumentData = ({
  vault,
  documentType,
  activeDocumentVersion,
}: ExtractedDocumentDataProps) => {
  const { t } = useTranslation('pages.entity.fieldset.document');
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
        <Typography variant="label-2">
          {t(`drawer.document-data.title`)}
        </Typography>
      </LabelContainer>
      <DocumentDataFieldContainer>
        {relevantKeys.sort().map(key => (
          <DocumentDataField key={key}>
            <Typography variant="body-3" color="tertiary" as="label">
              {t(
                `drawer.document-data.labels.${getDataLabel(
                  key,
                  activeDocumentVersion,
                )}`,
              )}
            </Typography>
            <Typography
              variant="body-3"
              color="primary"
              sx={{ textAlign: 'right' }}
            >
              {getVaultValueString(key)}
            </Typography>
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
  `}
`;

export default ExtractedDocumentData;
