import type { WithEntityProps } from '@/entity/components/with-entity';
import type { Icon } from '@onefootprint/icons';
import { type DataIdentifier, hasEntityBankAccounts, hasEntityCards } from '@onefootprint/types';
import { LinkButton, SegmentedControl, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { FIELDSET_HEADER_HEIGHT } from '../../../../../../constants';
import useDecryptForm from '../../../../hooks/use-decrypt-form';
import useField from '../../../../hooks/use-field';
import { useDecryptControls } from '../../../vault-actions';
import BankAccountFields from './components/bank-account-fields';
import CardFields from './components/card-fields';

export type FieldsetProps = WithEntityProps & {
  iconComponent: Icon;
  title: string;
};

const Fieldset = ({ entity, title, iconComponent: IconComponent }: FieldsetProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset' });
  const decrypt = useDecryptControls();

  const hasCardsAndBankAccounts = hasEntityCards(entity) && hasEntityBankAccounts(entity);
  const [isCard, setIsCard] = useState(hasEntityCards(entity));
  const [selectedItemDis, setSelectedItemDis] = useState<DataIdentifier[]>([]);

  const decryptForm = useDecryptForm();
  const getFieldProps = useField(entity);
  const selectableFields: DataIdentifier[] = selectedItemDis.filter(di => getFieldProps(di).canSelect);
  const allSelected = selectableFields.every(decryptForm.isChecked);
  const shouldShowSelectAll = decrypt.inProgress && selectableFields.length > 0;

  const handleSelectAll = () => {
    decryptForm.set(selectableFields, true);
  };

  const handleDeselectAll = () => {
    decryptForm.set(selectableFields, false);
  };

  return (
    <Container aria-label={title}>
      <Header>
        <Title>
          <IconComponent />
          <Text whiteSpace="nowrap" variant="label-3">
            {t('financial.title')}
          </Text>
        </Title>
        {hasCardsAndBankAccounts && !decrypt.inProgress && (
          <SegmentedControl
            size="compact"
            variant="secondary"
            aria-label={t('financial.control.aria')}
            options={[
              { label: t('financial.control.cards'), value: 'cards' },
              { label: t('financial.control.bank-accounts'), value: 'bank-accounts' },
            ]}
            value={isCard ? 'cards' : 'bank-accounts'}
            onChange={value => {
              setIsCard(value === 'cards');
            }}
          />
        )}
        {shouldShowSelectAll && (
          <LinkButton onClick={allSelected ? handleDeselectAll : handleSelectAll}>
            {allSelected ? t('deselect-all') : t('select-all')}
          </LinkButton>
        )}
      </Header>
      {isCard ? (
        <CardFields entity={entity} setSelectedItemDis={setSelectedItemDis} />
      ) : (
        <BankAccountFields entity={entity} setSelectedItemDis={setSelectedItemDis} />
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
    height: 100%;
  `};
`;

const Header = styled.header`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.spacing[2]} ${theme.spacing[2]} 0 0;
    flex: 0;
    display: flex;
    align-items: center;
    // keep constant height even when segmented control is removed
    min-height: ${FIELDSET_HEADER_HEIGHT}px;
    max-height: ${FIELDSET_HEADER_HEIGHT}px;
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

export default Fieldset;
