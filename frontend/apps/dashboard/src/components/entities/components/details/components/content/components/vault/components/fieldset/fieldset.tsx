import { useTranslation } from '@onefootprint/hooks';
import type { Icon } from '@onefootprint/icons';
import { Box, LinkButton, Typography } from '@onefootprint/ui';
import React, { Fragment } from 'react';
import styled, { css } from 'styled-components';

import { WithEntityProps } from '@/entity/components/with-entity';

import useField from '../../hooks/use-field';
import useForm from '../../hooks/use-form';
import { DiField } from '../../vault.types';
import { useDecryptControls } from '../decrypt-controls';
import Field from '../field';

export type FieldsetProps = WithEntityProps & {
  children?: React.ReactNode;
  fields: DiField[];
  footer?: React.ReactNode;
  iconComponent: Icon;
  title: string;
};

const Fieldset = ({
  children,
  entity,
  fields,
  footer,
  iconComponent: IconComponent,
  title,
}: FieldsetProps) => {
  const { t } = useTranslation('pages.entity.fieldset');
  const decrypt = useDecryptControls();
  const form = useForm();
  const dis = fields.map(field => field.di);
  const getFieldProps = useField(entity);
  const selectableFields = dis.filter(di => getFieldProps(di).canSelect);
  const allSelected = selectableFields.every(form.isChecked);
  const shouldShowSelectAll = decrypt.inProgress && selectableFields.length > 0;

  const handleSelectAll = () => {
    form.set(selectableFields, true);
  };

  const handleDeselectAll = () => {
    form.set(selectableFields, false);
  };

  const renderField = (field: DiField) => {
    const { di, renderCustomField } = field;
    return renderCustomField ? (
      <Fragment key={di}>{renderCustomField({ entity, di })}</Fragment>
    ) : (
      <Field key={di} di={di} entity={entity} />
    );
  };

  return (
    <Container aria-label={title}>
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
        <Content>{children || fields.map(renderField)}</Content>
      </Box>
      {footer && <Footer>{footer}</Footer>}
    </Container>
  );
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

const Header = styled.header`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]} ${theme.spacing[2]} 0 0;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
  `};
`;

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
  `};
`;

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[5]} ${theme.spacing[7]};
  `};
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[4]} 0;
    margin: 0 ${theme.spacing[7]};
  `};
`;

export default Fieldset;
