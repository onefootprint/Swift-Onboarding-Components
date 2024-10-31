import type { WithEntityProps } from '@/entity/components/with-entity';
import useEntitySeqno from '@/entity/hooks/use-entity-seqno';
import { IcoFileText16 } from '@onefootprint/icons';
import { Divider, LinkButton, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import useDecryptForm from '../../../../hooks/use-decrypt-form';
import useField from '../../../../hooks/use-field';
import type { DiField } from '../../../../vault.types';
import RiskSignalsOverview from '../../../risk-signals-overview';
import { useDecryptControls } from '../../../vault-actions';
import Content from './components/content';

export type DocumentFieldsetProps = WithEntityProps & {
  fields: DiField[];
};

const DocumentFieldset = ({ entity, fields }: DocumentFieldsetProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset',
  });
  const isViewingHistorical = Boolean(useEntitySeqno());
  const decrypt = useDecryptControls();
  const decryptForm = useDecryptForm();
  const dis = fields.map(field => field.di);
  const getFieldProps = useField(entity);
  const selectableFields = dis.filter(di => getFieldProps(di).canSelect);
  const allSelected = selectableFields.every(decryptForm.isChecked);
  const shouldShowSelectAll = decrypt.inProgress && selectableFields.length > 0;

  const handleSelectAll = () => {
    decryptForm.set(selectableFields, true);
  };

  const handleDeselectAll = () => {
    decryptForm.set(selectableFields, false);
  };

  return (
    <Container aria-label={t('documents.title')} data-primary-background={isViewingHistorical}>
      <Header data-primary-background={isViewingHistorical}>
        <Stack alignItems="center" gap={3}>
          <IcoFileText16 />
          <Text variant="label-2" tag="h2">
            {t('documents.title')}
          </Text>
        </Stack>
        {shouldShowSelectAll && (
          <LinkButton onClick={allSelected ? handleDeselectAll : handleSelectAll}>
            {allSelected ? t('deselect-all') : t('select-all')}
          </LinkButton>
        )}
      </Header>
      <Stack direction="column" gap={5} paddingTop={5} paddingRight={5} paddingBottom={4} paddingLeft={5}>
        <Content entity={entity} />
        <Stack tag="footer" direction="column" gap={4}>
          <Divider />
          <RiskSignalsOverview type="document" />
        </Stack>
      </Stack>
    </Container>
  );
};

const Container = styled.fieldset`
  ${({ theme }) => css`
    border-radius: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    justify-content: space-between;

    &[data-primary-background='true'] {
      background-color: ${theme.backgroundColor.primary};
    }
  `};
`;

const Header = styled.header`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]} ${theme.spacing[2]} 0 0;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};

    &[data-primary-background='true'] {
      background-color: ${theme.backgroundColor.primary};
    }
  `};
`;

export default DocumentFieldset;
