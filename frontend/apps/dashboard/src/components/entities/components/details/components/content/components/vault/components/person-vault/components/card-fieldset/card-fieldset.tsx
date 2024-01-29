import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { EntityCard, VaultValue } from '@onefootprint/types';
import { Box, LinkButton, Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FieldOrPlaceholder from 'src/components/field-or-placeholder';

import type { WithEntityProps } from '@/entity/components/with-entity';

import getDis from '../../../../../../../../../../utils/get-dis';
import useDecryptForm from '../../../../hooks/use-decrypt-form';
import useField from '../../../../hooks/use-field';
import type { DiField } from '../../../../vault.types';
import getCards from '../../../card-fieldset/utils/get-cards';
import Field from '../../../field';
import { useDecryptControls } from '../../../vault-actions';
import CardHeader from './components/card-header';

export type FieldsetProps = WithEntityProps & {
  iconComponent: Icon;
  title: string;
};

const Fieldset = ({
  entity,
  title,
  iconComponent: IconComponent,
}: FieldsetProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset',
  });
  const decrypt = useDecryptControls();
  const decryptForm = useDecryptForm();

  const cards: EntityCard[] = getCards(entity) ?? [];
  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const dis = getDis(entity.attributes, selectedCard.alias);
  const fields = dis.map(di => ({ di }));

  const getFieldProps = useField(entity);
  const selectableFields = dis.filter(di => getFieldProps(di).canSelect);
  const allSelected = selectableFields.every(decryptForm.isChecked);
  const shouldShowSelectAll = decrypt.inProgress && selectableFields.length > 0;

  const getCardTitle = (count: number) =>
    `${title} ${t('cards.title', { count })}`;

  const handleSelectAll = () => {
    decryptForm.set(selectableFields, true);
  };

  const handleDeselectAll = () => {
    decryptForm.set(selectableFields, false);
  };

  const renderCardIssuer = (value: VaultValue) => {
    const changedValue = t(
      `cards.card-brands.${value}` as ParseKeys<'common'>,
    ) as string;
    return <FieldOrPlaceholder data={changedValue} />;
  };

  const renderField = (field: DiField) => {
    const { di } = field;
    const tKeyWithoutAlias = `di.${di.replace(`${selectedCard.alias}.`, '')}`;

    if (di.endsWith('issuer')) {
      return (
        <Field
          renderValue={renderCardIssuer}
          key={di}
          di={di}
          entity={entity}
          renderLabel={() => t(tKeyWithoutAlias as ParseKeys<'common'>)}
        />
      );
    }
    return (
      <Field
        key={di}
        di={di}
        entity={entity}
        renderLabel={() => t(tKeyWithoutAlias as ParseKeys<'common'>)}
      />
    );
  };

  return (
    <Container aria-label={title}>
      <Box>
        <Header>
          <Title>
            <IconComponent />
            <Typography sx={{ whiteSpace: 'nowrap' }} variant="label-3">
              {getCardTitle(cards.length)}
            </Typography>
          </Title>
          {!decrypt.inProgress && cards.length > 1 && (
            <CardHeader
              cards={cards}
              selectedCard={selectedCard}
              onChange={setSelectedCard}
            />
          )}
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
    gap: ${theme.spacing[4]};
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

export default Fieldset;
