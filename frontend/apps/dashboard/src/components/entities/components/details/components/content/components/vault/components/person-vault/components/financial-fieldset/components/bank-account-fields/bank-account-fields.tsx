import type { DataIdentifier, Entity, EntityBankAccount } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { Divider } from '@onefootprint/ui';
import { useEffect, useState } from 'react';
import useEntityDuplicateData from 'src/components/entities/components/details/hooks/use-entity-duplicate-data';
import { getBankDis } from 'src/components/entities/utils/get-dis';
import getBankAccounts from '../../../../../../utils/get-bank-accounts';
import type { DiField } from '../../../../../../vault.types';
import Field from '../../../../../field';
import useGetTranslationWithoutAlias from '../../utils/use-get-translation-without-alias';
import BankDuplicateDrawer from './bank-duplicate-drawer/bank-duplicate-drawer';
import BankAccountSelector from './components/bank-account-selector';

export type BankAccountFieldsProps = {
  entity: Entity;
  setSelectedItemDis: (dis: DataIdentifier[]) => void;
};

const BankAccountFields = ({ entity, setSelectedItemDis }: BankAccountFieldsProps) => {
  const bankAccounts: EntityBankAccount[] = getBankAccounts(entity);
  const [selectedBankAccount, setSelectedBankAccount] = useState<EntityBankAccount | undefined>(
    bankAccounts.length > 0 ? bankAccounts[0] : undefined,
  );
  const [duplicateDrawerOpen, setDuplicateDrawerOpen] = useState(true);
  const getTranslationsWithoutAlias = useGetTranslationWithoutAlias();
  const { data: duplicateData, isLoading: isDuplicateDataLoading } = useEntityDuplicateData(entity.id);

  const dis = getBankDis(entity.attributes, selectedBankAccount?.alias);
  const fields = dis.map(di => ({ di }));

  const renderField = (field: DiField) => {
    const { di } = field;
    return <Field key={di} di={di} entity={entity} renderLabel={() => getTranslationsWithoutAlias(di)} />;
  };

  const closeDuplicateDataDrawer = () => {
    setDuplicateDrawerOpen(false);
  };

  useEffect(() => {
    setSelectedItemDis(dis);
  }, [selectedBankAccount]);

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
      <BankDuplicateDrawer
        isOpen={duplicateDrawerOpen}
        onClose={closeDuplicateDataDrawer}
        dupes={duplicateData?.sameTenant ?? []}
        fingerprint={selectedBankAccount?.fingerprint}
        isLoading={isDuplicateDataLoading}
      />
    </Stack>
  );
};

export default BankAccountFields;
