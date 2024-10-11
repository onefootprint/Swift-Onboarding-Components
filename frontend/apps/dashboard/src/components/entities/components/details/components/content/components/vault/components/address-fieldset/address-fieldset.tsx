import type { Icon } from '@onefootprint/icons';
import { Divider, LinkButton, Stack, Text } from '@onefootprint/ui';
import type React from 'react';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { WithEntityProps } from '@/entity/components/with-entity';
import useEntitySeqno from '@/entity/hooks/use-entity-seqno';

import { IcoInfo16 } from '@onefootprint/icons';
import type { IdDI } from '@onefootprint/types';
import { FIELDSET_HEADER_HEIGHT } from '../../../../constants';
import useDecryptForm from '../../hooks/use-decrypt-form';
import useField from '../../hooks/use-field';
import type { DiField } from '../../vault.types';
import Field from '../field';
import { useDecryptControls } from '../vault-actions';
import StreetViewDialog from './components/street-view-dialog';

export type AddressFieldsetProps = WithEntityProps & {
  children?: React.ReactNode;
  fields: DiField[];
  footer?: React.ReactNode;
  iconComponent: Icon;
  title: string;
};

const AddressFieldset = ({
  children,
  entity,
  fields,
  footer,
  iconComponent: IconComponent,
  title,
}: AddressFieldsetProps) => {
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
  const [streetViewDialogOpen, setStreetViewDialogOpen] = useState(false);

  const addressValues: Partial<Record<IdDI, string>> = Object.fromEntries(
    fields.map(field => [
      field.di,
      typeof getFieldProps(field.di).value === 'string' ? getFieldProps(field.di).value : '',
    ]),
  );

  const handleSelectAll = () => {
    decryptForm.set(selectableFields, true);
  };

  const handleDeselectAll = () => {
    decryptForm.set(selectableFields, false);
  };

  const closeStreetViewDialog = () => {
    setStreetViewDialogOpen(false);
  };

  const renderField = (field: DiField) => {
    const { di, renderCustomField } = field;
    return renderCustomField ? (
      <Fragment key={di}>{renderCustomField({ entity, di })}</Fragment>
    ) : (
      <Field key={di} di={di} entity={entity} />
    );
  };

  const renderStreetViewToggle = () => {
    const validAddressValues = Object.values(addressValues).filter(value => !!value);
    const hasDecryptedFullAddress = validAddressValues.length >= 5;

    if (hasDecryptedFullAddress) {
      return (
        <LinkButton onClick={() => setStreetViewDialogOpen(true)}>
          {t('address.street-view.see-street-view')}
        </LinkButton>
      );
    }
    return (
      <Stack direction="row" gap={1} alignItems="center">
        <IcoInfo16 color="tertiary" />
        <Text variant="body-3" color="tertiary">
          {t('address.street-view.decrypt-data')}
        </Text>
      </Stack>
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
      <Stack direction="column" gap={7} padding={5} flex={1}>
        <Stack direction="column" gap={4}>
          {children || fields.map(renderField)}
        </Stack>
        {renderStreetViewToggle()}
      </Stack>
      <StreetViewDialog open={streetViewDialogOpen} onClose={closeStreetViewDialog} addressValues={addressValues} />
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

export default AddressFieldset;
