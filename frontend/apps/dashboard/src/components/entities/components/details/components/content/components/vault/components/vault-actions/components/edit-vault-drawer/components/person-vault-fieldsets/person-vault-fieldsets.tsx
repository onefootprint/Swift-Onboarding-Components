import { type Entity, hasEntityUsLegalStatus } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import Fieldset from '../../../../../fieldset';
import useFieldsets from '../../../../../person-vault/hooks/use-fieldsets';

type PersonVaultFieldsetsProps = {
  entity: Entity;
};

const PersonVaultFieldsets = ({ entity }: PersonVaultFieldsetsProps) => {
  const hasUsLegalStatus = hasEntityUsLegalStatus(entity);
  const { basic, address, usLegalStatus, identity } = useFieldsets(hasUsLegalStatus);

  return (
    <Stack direction="column" gap={5}>
      <Fieldset fields={basic.fields} iconComponent={basic.iconComponent} title={basic.title} />
      <Fieldset fields={address.fields} iconComponent={address.iconComponent} title={address.title} />
      <Fieldset fields={identity.fields} iconComponent={identity.iconComponent} title={identity.title} />
      {hasUsLegalStatus && (
        <Fieldset
          fields={usLegalStatus.fields}
          iconComponent={usLegalStatus.iconComponent}
          title={usLegalStatus.title}
        />
      )}
    </Stack>
  );
};

export default PersonVaultFieldsets;
