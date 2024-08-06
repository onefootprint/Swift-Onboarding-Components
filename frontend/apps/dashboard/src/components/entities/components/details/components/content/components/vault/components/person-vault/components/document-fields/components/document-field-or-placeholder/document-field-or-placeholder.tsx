import { Document, Entity, EntityVault, SupportedIdDocTypes } from '@onefootprint/types';
import { Checkbox, Text, Tooltip } from '@onefootprint/ui';

import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import EncryptedCell from 'src/components/encrypted-cell';
import styled, { css } from 'styled-components';
import { useDecryptControls } from '../../../../../vault-actions';
import DocumentField from '../document-field';
import DocumentStatusBadge from '../document-status-badge';
import { useDocumentField } from './hooks/use-document-field';

type DocumentFieldOrPlaceholderProps = {
  kind: SupportedIdDocTypes;
  entity: Entity;
  vault: EntityVault;
  documents: Document[];
};

const DocumentFieldOrPlaceholder = ({ kind, entity, vault, documents }: DocumentFieldOrPlaceholderProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.decrypt' });
  const { register } = useFormContext();
  const field = useDocumentField(entity)(kind);
  const decrypt = useDecryptControls();
  const isChecked = field.isDecrypted || decrypt.inProgressDecryptingAll;

  return (
    <Container role="row" aria-label={field.label}>
      {field.showCheckbox ? (
        <Tooltip disabled={field.canDecrypt} position="right" text={t('not-allowed')}>
          <Checkbox
            checked={isChecked || undefined}
            {...register(`documents.${kind}`)}
            label={field.label}
            disabled={field.disabled}
          />
        </Tooltip>
      ) : (
        <LabelContainer>
          <LabelAndStatusContainer>
            <Text variant="body-3" color="tertiary" tag="label">
              {field.label}
            </Text>
            <DocumentStatusBadge documents={documents} documentType={kind} />
          </LabelAndStatusContainer>
        </LabelContainer>
      )}
      {field.isDecrypted ? (
        <DocumentField vault={vault} documentType={kind} documents={documents} />
      ) : (
        <EncryptedCell />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: column;
  `};
`;

const LabelAndStatusContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  `};
`;

export default DocumentFieldOrPlaceholder;
