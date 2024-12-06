import { Stack, Text } from '@onefootprint/ui';
import type { FieldsetField } from '../../hooks/use-fieldsets/use-fieldsets';
import Field from '../field';

type FieldsetProps = {
  fields: FieldsetField[];
  title: string;
};

const Fieldset = ({ title, fields }: FieldsetProps) => {
  return (
    <Stack direction="column" gap={3}>
      <Text variant="label-3">{title}</Text>
      <Stack direction="column" gap={2} flex={1}>
        {fields.map(({ di }) => (
          <Field key={di} di={di} />
        ))}
      </Stack>
    </Stack>
  );
};

export default Fieldset;
