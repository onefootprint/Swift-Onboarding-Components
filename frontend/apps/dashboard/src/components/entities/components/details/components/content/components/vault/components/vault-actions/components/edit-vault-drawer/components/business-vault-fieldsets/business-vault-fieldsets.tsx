import { EntityKind } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import useEditFieldsets from '../../hooks/use-edit-fieldsets';
import EditFieldset from '../edit-fieldset';

const BusinessVaultFieldsets = () => {
  const { basic, address } = useEditFieldsets(EntityKind.business);

  return (
    <Stack direction="column" gap={5}>
      <EditFieldset fields={basic.fields} iconComponent={basic.iconComponent} title={basic.title} />
      <EditFieldset fields={address.fields} iconComponent={address.iconComponent} title={address.title} />
    </Stack>
  );
};

export default BusinessVaultFieldsets;
