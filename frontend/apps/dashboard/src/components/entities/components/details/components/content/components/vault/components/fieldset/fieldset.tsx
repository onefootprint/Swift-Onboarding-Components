import { useTranslation } from '@onefootprint/hooks';
import type { Icon } from '@onefootprint/icons';
import { DataIdentifier, isVaultDataEncrypted } from '@onefootprint/types';
import { Box, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import useEntityVault from 'src/components/entities/hooks/use-entity-vault';
import usePermissions from 'src/hooks/use-permissions';
import styled, { css } from 'styled-components';

import { WithEntityProps } from '@/entity/components/with-entity';

import useForm from '../../hooks/use-form';
import { DiField } from '../../vault.types';
import { useDecryptControls } from '../decrypt-controls';
import Field from '../field';

export type FieldsetProps = WithEntityProps & {
  fields: DiField[];
  footer?: React.ReactNode;
  iconComponent: Icon;
  title: string;
};

const Fieldset = ({
  entity,
  fields,
  footer,
  iconComponent: IconComponent,
  title,
}: FieldsetProps) => {
  const { t, allT } = useTranslation('pages.entity.fieldset');
  const decrypt = useDecryptControls();
  const entityVault = useEntityVault(entity.id, entity);
  const { isAdmin, scopes } = usePermissions();
  const form = useForm();
  const dis = fields.map(field => field.di);

  const canDecryptDI = (di: DataIdentifier) => {
    const canAccess = !!entity.onboarding?.canAccessAttributes.includes(di);
    const hasDecryptRole = scopes.some(scope =>
      entity.onboarding?.canAccessPermissions.includes(scope),
    );
    return canAccess && (isAdmin || hasDecryptRole);
  };

  const canSelectDI = (di: DataIdentifier) => {
    const value = entityVault.data?.[di];
    return canDecryptDI(di) && isVaultDataEncrypted(value);
  };

  const selectableFields = dis.filter(canSelectDI);
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
    const canDecrypt = canDecryptDI(di);
    const disabled = !canSelectDI(di);
    const label = allT(`di.${di}`);
    const name = di;
    const showCheckbox = decrypt.inProgress;
    const value = entityVault.data?.[di];

    return renderCustomField ? (
      renderCustomField({
        canDecrypt,
        disabled,
        label,
        name,
        showCheckbox,
        value,
      })
    ) : (
      <Field
        canDecrypt={canDecrypt}
        disabled={!canSelectDI(di)}
        key={di}
        label={allT(`di.${di}`)}
        name={di}
        showCheckbox={decrypt.inProgress}
        value={entityVault.data?.[di]}
      />
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
        <Content>{fields.map(renderField)}</Content>
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
