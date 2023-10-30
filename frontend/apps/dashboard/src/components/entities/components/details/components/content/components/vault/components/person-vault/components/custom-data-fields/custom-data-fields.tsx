import { useTranslation } from '@onefootprint/hooks';
import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Box,
  CodeInline,
  Grid,
  LinkButton,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { getCustomDIs } from 'src/components/entities/utils/get-dis';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import type { WithEntityProps } from '@/entity/components/with-entity';

import useField from '../../../../hooks/use-field';
import useForm from '../../../../hooks/use-form';
import type { DiField } from '../../../../vault.types';
import Field from '../../../field';
import { useDecryptControls } from '../../../vault-actions';

type CustomDataFieldsProps = WithEntityProps & {
  iconComponent: Icon;
  title: string;
};

const CustomDataFields = ({
  entity,
  iconComponent: IconComponent,
  title,
}: CustomDataFieldsProps) => {
  const { t } = useTranslation('pages.entity.fieldset');
  const decrypt = useDecryptControls();
  const form = useForm();
  const getFieldProps = useField(entity);
  const { data } = useEntityVault(entity.id, entity);
  const customDIs = getCustomDIs(data || {});
  const selectableFields = customDIs.filter(di => getFieldProps(di).canSelect);
  const allSelected = selectableFields.every(form.isChecked);
  const shouldShowSelectAll = decrypt.inProgress && selectableFields.length > 0;

  const handleSelectAll = () => {
    form.set(selectableFields, true);
  };

  const handleDeselectAll = () => {
    form.set(selectableFields, false);
  };

  const renderField = (field: DiField) => (
    <Field
      key={field.di}
      renderLabel={() => <CodeInline disabled>{field.di}</CodeInline>}
      di={field.di}
      entity={entity}
    />
  );

  return data ? (
    <Container>
      <Box>
        <Header>
          <Title>
            <IconComponent />
            <Typography variant="label-3">{title}</Typography>
          </Title>
          {shouldShowSelectAll && (
            <LinkButton
              onClick={allSelected ? handleDeselectAll : handleSelectAll}
              size="compact"
            >
              {allSelected ? t('deselect-all') : t('select-all')}
            </LinkButton>
          )}
        </Header>
        <Grid.Container
          columnGap={12}
          gap={4}
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
