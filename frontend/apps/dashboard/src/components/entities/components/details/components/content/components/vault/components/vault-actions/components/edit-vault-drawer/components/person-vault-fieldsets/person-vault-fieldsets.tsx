import { type Entity, EntityKind, hasEntityNationality, hasEntityUsLegalStatus } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import useEditFieldsets from '../../hooks/use-edit-fieldsets';
import EditFieldset from '../edit-fieldset';

type PersonVaultFieldsetsProps = {
  entity: Entity;
};

const PersonVaultFieldsets = ({ entity }: PersonVaultFieldsetsProps) => {
  const hasLegalStatus = hasEntityUsLegalStatus(entity);
  const includeNationality = hasEntityNationality(entity) && !hasLegalStatus;
  const { basic, address, usLegalStatus, identity } = useEditFieldsets(EntityKind.person, includeNationality);

  return (
    <Stack direction="column" gap={5}>
      <EditFieldset fields={basic.fields} iconComponent={basic.iconComponent} title={basic.title} />
      <EditFieldset fields={address.fields} iconComponent={address.iconComponent} title={address.title} />
      <EditFieldset fields={identity.fields} iconComponent={identity.iconComponent} title={identity.title} />
      {hasLegalStatus && (
        <EditFieldset
          fields={usLegalStatus.fields}
          iconComponent={usLegalStatus.iconComponent}
          title={usLegalStatus.title}
        />
      )}
    </Stack>
  );
};

export default PersonVaultFieldsets;
