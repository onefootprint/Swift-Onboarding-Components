import type { Entity, EntityBankAccount } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { Divider } from '@onefootprint/ui';
import { useMemo, useState } from 'react';
import { getBankDis } from 'src/components/entities/utils/get-dis';
import getBankAccounts from '../../../../../../utils/get-bank-accounts';
import type { DiField } from '../../../../../../vault.types';
import Field from '../../../../../field';
import useGetTranslationWithoutAlias from '../../utils/use-get-translation-without-alias';
import BankAccountSelector from '../bank-account-selector';

export type BankAccountFieldsProps = {
  entity: Entity;
};

const BankAccountFields = ({ entity }: BankAccountFieldsProps) => {
  const bankAccounts: EntityBankAccount[] = getBankAccounts(entity);
  const [selectedBankAccount, setSelectedBankAccount] = useState<EntityBankAccount | undefined>(
    bankAccounts.length > 0 ? bankAccounts[0] : undefined,
  );
  const getTranslationsWithoutAlias = useGetTranslationWithoutAlias();

  const dis = useMemo(() => {
    return getBankDis(entity.attributes, selectedBankAccount?.alias);
  }, [entity.attributes, selectedBankAccount?.alias]);
  const fields = useMemo(() => {
    return dis.map(di => ({ di }));
  }, [dis]);

  const renderField = (field: DiField) => {
    const { di } = field;
    return <Field key={di} di={di} entity={entity} renderLabel={() => getTranslationsWithoutAlias(di)} />;
  };

  return (
    <Stack direction="column" gap={5} padding={5} flex={1}>
      {bankAccounts.length > 0 && (
        <>
          <BankAccountSelector
            bankAccounts={bankAccounts}
            selected={selectedBankAccount}
            onChange={setSelectedBankAccount}
          />

          <Divider />
        </>
      )}
      <Stack direction="column" gap={4}>
        {fields.map(field => renderField(field))}
      </Stack>
    </Stack>
  );
};

export default BankAccountFields;
