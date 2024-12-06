import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { Stack, Text } from '@onefootprint/ui';
import type { UseFieldProps } from '../../hooks/use-field';
import type { FieldsetField } from '../../hooks/use-fieldsets/use-fieldsets';
import Field from '../field';

type FieldsetProps = {
  fields: FieldsetField[];
  title: string;
  useField: (di: DataIdentifier) => UseFieldProps;
};

const Fieldset = ({ fields, title, useField }: FieldsetProps) => {
  return (
    <Stack direction="column" gap={3}>
      <Text variant="label-3">{title}</Text>
      <Stack direction="column" gap={2} flex={1}>
        {fields.map(({ di }) => (
          <Field key={di} di={di} useField={useField} />
        ))}
      </Stack>
    </Stack>
  );
};

export default Fieldset;
