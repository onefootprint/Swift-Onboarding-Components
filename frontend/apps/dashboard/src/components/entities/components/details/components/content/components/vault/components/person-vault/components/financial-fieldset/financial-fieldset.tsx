import type { WithEntityProps } from '@/entity/components/with-entity';
import type { Icon } from '@onefootprint/icons';
import type { DataIdentifier, EntityBankAccount, EntityCard, VaultValue } from '@onefootprint/types';
import { hasEntityBankAccounts, hasEntityCards } from '@onefootprint/types';
import { Divider, LinkButton, SegmentedControl, Stack, Text } from '@onefootprint/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FieldOrPlaceholder from 'src/components/field-or-placeholder';
import styled, { css } from 'styled-components';
import useDecryptForm from '../../../../hooks/use-decrypt-form';
import useField from '../../../../hooks/use-field';

import { getBankDis, getCardDis } from 'src/components/entities/utils/get-dis';
import { FIELDSET_HEADER_HEIGHT } from '../../../../../../constants';
import getBankAccounts from '../../../../utils/get-bank-accounts';
import getCards from '../../../../utils/get-cards';
import type { DiField } from '../../../../vault.types';
import Field from '../../../field';
import { useDecryptControls } from '../../../vault-actions';
import useGetCardIssuer from './utils/use-get-card-issuer';
import useGetTranslationWithoutAlias from './utils/use-get-translation-without-alias';

import BankAccountSelector from './components/bank-account-selector';
import CardSelector from './components/card-selector';

export type FieldsetProps = WithEntityProps & {
  iconComponent: Icon;
  title: string;
};

const Fieldset = ({ entity, title, iconComponent: IconComponent }: FieldsetProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset' });
  const decrypt = useDecryptControls();
  const getTranslationsWithoutAlias = useGetTranslationWithoutAlias();
  const getCardIssuer = useGetCardIssuer();

  const cards: EntityCard[] = getCards(entity);
  const bankAccounts: EntityBankAccount[] = getBankAccounts(entity);
  const hasCardsAndBankAccounts = hasEntityCards(entity) && hasEntityBankAccounts(entity);
  const [isCard, setIsCard] = useState(cards?.length > 0);
  const [selectedCard, setSelectedCard] = useState<EntityCard | undefined>(cards.length > 0 ? cards[0] : undefined);
  const [selectedBankAccount, setSelectedBankAccount] = useState<EntityBankAccount | undefined>(
    bankAccounts.length > 0 ? bankAccounts[0] : undefined,
  );
  const selectedItem = isCard ? selectedCard : selectedBankAccount;

  const dis = useMemo(() => {
    return isCard
      ? getCardDis(entity.attributes, selectedItem?.alias)
      : getBankDis(entity.attributes, selectedItem?.alias);
  }, [isCard, entity.attributes, selectedItem?.alias]);
  const fields = useMemo(() => {
    return dis.map(di => ({ di }));
  }, [entity.attributes, selectedItem?.alias, isCard]);

  const decryptForm = useDecryptForm();
  const getFieldProps = useField(entity);
  const selectableFields: DataIdentifier[] = dis.filter(di => getFieldProps(di).canSelect);
  const allSelected = selectableFields.every(decryptForm.isChecked);
  const shouldShowSelectAll = decrypt.inProgress && selectableFields.length > 0;

  const handleSelectAll = () => {
    decryptForm.set(selectableFields, true);
  };

  const handleDeselectAll = () => {
    decryptForm.set(selectableFields, false);
  };

  const renderCardIssuer = (value: VaultValue) => {
    const changedValue = getCardIssuer(value);
    return <FieldOrPlaceholder data={changedValue} />;
  };

  const renderField = (field: DiField) => {
    const { di } = field;

    if (di.endsWith('issuer') && isCard) {
      return (
        <Field
          renderValue={renderCardIssuer}
          key={di}
          di={di}
          entity={entity}
          renderLabel={() => getTranslationsWithoutAlias(di)}
        />
      );
    }
    return <Field key={di} di={di} entity={entity} renderLabel={() => getTranslationsWithoutAlias(di)} />;
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
      <Stack direction="column" gap={5} padding={5} flex={1}>
        {hasCardsAndBankAccounts && (
          <>
            {isCard ? (
              <CardSelector cards={cards} selected={selectedCard} onChange={setSelectedCard} />
            ) : (
              <BankAccountSelector
                bankAccounts={bankAccounts}
                selected={selectedBankAccount}
                onChange={setSelectedBankAccount}
              />
            )}
            <Divider />
          </>
        )}
        <Stack direction="column" gap={4}>
          {fields.map(field => renderField(field))}
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
