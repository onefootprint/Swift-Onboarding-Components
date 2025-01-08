import { getEntitiesByFpIdBusinessOwnersOptions } from '@onefootprint/axios/dashboard';
import { EntityKind } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import useEditFieldsets from '../../hooks/use-edit-fieldsets';
import EditFieldset from '../edit-fieldset';
import EditBeneficialOwnersFieldset from './components/edit-beneficial-owners-fieldset';

type BusinessVaultFieldsetsProps = {
  id: string;
};

const BusinessVaultFieldsets = ({ id }: BusinessVaultFieldsetsProps) => {
  const { data: beneficialOwners } = useQuery(
    getEntitiesByFpIdBusinessOwnersOptions({
      path: { fpId: id },
    }),
  );
  const { basic, address } = useEditFieldsets(EntityKind.business);
  const hasBOs = beneficialOwners && beneficialOwners.length > 0;

  return (
    <Stack direction="column" gap={5}>
      <EditFieldset fields={basic.fields} iconComponent={basic.iconComponent} title={basic.title} />
      <EditFieldset fields={address.fields} iconComponent={address.iconComponent} title={address.title} />
      {hasBOs && <EditBeneficialOwnersFieldset beneficialOwners={beneficialOwners} />}
    </Stack>
  );
};

export default BusinessVaultFieldsets;
