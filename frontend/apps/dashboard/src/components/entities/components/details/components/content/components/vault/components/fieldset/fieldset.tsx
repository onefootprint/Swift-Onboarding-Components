import type { Icon } from '@onefootprint/icons';
import { Divider, LinkButton, Stack, Text } from '@onefootprint/ui';
import type React from 'react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { WithEntityProps } from '@/entity/components/with-entity';
import useEntitySeqno from '@/entity/hooks/use-entity-seqno';

import { FIELDSET_HEADER_HEIGHT } from '../../../../constants';
import useDecryptForm from '../../hooks/use-decrypt-form';
import useField from '../../hooks/use-field';
import type { DiField } from '../../vault.types';
import Field from '../field';
import { useDecryptControls } from '../vault-actions';

export type FieldsetProps = WithEntityProps & {
  children?: React.ReactNode;
  fields: DiField[];
  footer?: React.ReactNode;
  iconComponent: Icon;
  title: string;
};

const Fieldset = ({ children, entity, fields, footer, iconComponent: IconComponent, title }: FieldsetProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset',
  });
  const isViewingHistorical = !!useEntitySeqno();
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

  const renderField = (field: DiField) => {
    const { di, renderCustomField } = field;
    return renderCustomField ? (
      <Fragment key={di}>{renderCustomField({ entity, di })}</Fragment>
    ) : (
      <Field key={di} di={di} entity={entity} />
    );
  };

  return (
    <Container aria-label={title} data-primary-background={isViewingHistorical}>
      <Header data-primary-background={isViewingHistorical}>
        <Title>
          <IconComponent />
          <Text variant="label-3" tag="h2">
            {title}
          </Text>
        </Title>
        {shouldShowSelectAll && (
          <LinkButton onClick={allSelected ? handleDeselectAll : handleSelectAll}>
            {allSelected ? t('deselect-all') : t('select-all')}
          </LinkButton>
        )}
      </Header>
      <Stack direction="column" gap={4} padding={5} flex={1}>
        {children || fields.map(renderField)}
      </Stack>
      {footer && (
        <Footer tag="footer">
          <Divider />
          {footer}
        </Footer>
      )}
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
    height: ${FIELDSET_HEADER_HEIGHT}px;

    &[data-primary-background='true'] {
      background-color: ${theme.backgroundColor.primary};
    }
  `};
`;

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
  `};
`;

const Footer = styled(Stack)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    padding: 0 ${theme.spacing[5]} ${theme.spacing[4]} ${theme.spacing[5]};
  `};
`;

export default Fieldset;
