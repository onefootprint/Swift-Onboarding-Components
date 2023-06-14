import { useTranslation } from '@onefootprint/hooks';
import { type Icon } from '@onefootprint/icons';
import { DataIdentifier, EntityCard } from '@onefootprint/types';
import { Box, LinkButton, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import useEntityVault from 'src/components/entities/hooks/use-entity-vault';
import styled, { css } from 'styled-components';

import { WithEntityProps } from '@/entity/components/with-entity';

import useField from '../../hooks/use-field';
import useForm from '../../hooks/use-form';
import { DiField } from '../../vault.types';
import { useDecryptControls } from '../decrypt-controls';
import Field from '../field';
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
  const { t, allT } = useTranslation('pages.entity.fieldset');
  const decrypt = useDecryptControls();
  const form = useForm();
  const { data } = useEntityVault(entity.id, entity);
  const cards: EntityCard[] = data?.cards ?? [];
  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const dis = getCardDis(entity.attributes, selectedCard.alias);
  const fields = dis.map(di => ({ di }));

  const getFieldProps = useField(entity);
  const selectableFields = dis.filter(di => getFieldProps(di).canSelect);
  const allSelected = selectableFields.every(form.isChecked);
  const shouldShowSelectAll = decrypt.inProgress && selectableFields.length > 0;

  const getCardTitle = (length: number) =>
    `${title} • ${length} ${length > 1 ? t('cards') : t('card')}`;

  const handleSelectAll = () => {
    form.set(selectableFields, true);
  };

  const handleDeselectAll = () => {
    form.set(selectableFields, false);
  };

  const renderField = (field: DiField) => {
    const { di } = field;
    return (
      <Field
        key={di}
        di={di}
        entity={entity}
        renderLabel={() => (
          <Typography variant="body-3" color="tertiary" as="label">
            {allT(`di.${di.replace(`${selectedCard.alias}.`, '')}`)}
          </Typography>
        )}
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
          <CardHeader
            cards={cards}
            selectedCard={selectedCard}
            onChange={setSelectedCard}
          />
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

const getCardDis = (attributes: DataIdentifier[], search: any) =>
  attributes.filter(
    attr =>
      attr.includes(`card.${search}`) &&
      // exclude expiration_month, expiration_year; only show expiration
      !attr.includes(`expiration_month`) &&
      !attr.includes(`expiration_year`),
  );

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
