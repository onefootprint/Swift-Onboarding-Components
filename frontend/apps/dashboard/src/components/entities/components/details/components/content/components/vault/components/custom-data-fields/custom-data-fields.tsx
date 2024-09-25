import type { Icon } from '@onefootprint/icons';
import { DataKind, isVaultDataDecrypted } from '@onefootprint/types';
import { Box, CodeInline, Grid, LinkButton, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import { getCustomDIs } from 'src/components/entities/utils/get-dis';
import styled, { css } from 'styled-components';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import type { WithEntityProps } from '@/entity/components/with-entity';

import useDecryptForm from '../../hooks/use-decrypt-form';
import useField from '../../hooks/use-field';
import type { DiField } from '../../vault.types';
import Field from '../field';
import { useDecryptControls } from '../vault-actions';
import CustomDocumentField from './components/custom-document-field';

type CustomDataFieldsProps = WithEntityProps & {
  iconComponent: Icon;
  title: string;
};

const CustomDataFields = ({ entity, iconComponent: IconComponent, title }: CustomDataFieldsProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset',
  });
  const decrypt = useDecryptControls();
  const decryptForm = useDecryptForm();
  const getFieldProps = useField(entity);
  const { data: vaultWithTransforms } = useEntityVault(entity.id, entity);
  const { vault: vaultData, dataKinds } = vaultWithTransforms || {};
  const customDIs = getCustomDIs(vaultData || {});
  const selectableFields = customDIs.filter(di => getFieldProps(di).canSelect);
  const allSelected = selectableFields.every(decryptForm.isChecked);
  const shouldShowSelectAll = decrypt.inProgress && selectableFields.length > 0;

  const handleSelectAll = () => {
    decryptForm.set(selectableFields, true);
  };

  const handleDeselectAll = () => {
    decryptForm.set(selectableFields, false);
  };

  const renderField = (field: DiField) => {
    const isDecrypted = isVaultDataDecrypted(vaultData?.[field.di]);
    const isDocument = dataKinds?.[field.di] === DataKind.documentData;
    if (isDecrypted && isDocument) {
      return <CustomDocumentField field={field} entity={entity} />;
    }

    return (
      <Field
        key={field.di}
        renderLabel={() => <CodeInline disabled>{field.di}</CodeInline>}
        di={field.di}
        entity={entity}
      />
    );
  };

  return vaultData ? (
    <Container>
      <Box>
        <Header>
          <Title>
            <IconComponent />
            <Text variant="label-3">{title}</Text>
          </Title>
          {shouldShowSelectAll && (
            <LinkButton onClick={allSelected ? handleDeselectAll : handleSelectAll}>
              {allSelected ? t('deselect-all') : t('select-all')}
            </LinkButton>
          )}
        </Header>
        <Grid.Container
          columnGap={10}
          rowGap={4}
          width="100%"
          columns={['repeat(2, 1fr)']}
          paddingTop={5}
          paddingBottom={5}
          paddingRight={7}
          paddingLeft={7}
        >
          {customDIs.map(di => renderField({ di }))}
        </Grid.Container>
      </Box>
    </Container>
  ) : null;
};

const Container = styled.fieldset`
  ${({ theme }) => css`
    border-radius: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    justify-content: space-between;
  `};
`;

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
  `};
`;

const Header = styled.header`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]} ${theme.spacing[2]} 0 0;
    display: flex;
    justify-content: space-between;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `};
`;

export default CustomDataFields;
