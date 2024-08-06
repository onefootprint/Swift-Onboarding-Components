import { Grid } from '@onefootprint/ui';

import type { FieldProps } from '../field';
import Field from '../field';

type FieldsListProps = {
  fields: FieldProps[];
};

const FieldsList = ({ fields }: FieldsListProps) => (
  <Grid.Container columns={['1fr 1fr']} rows={['1fr auto']} width="100%" gap={4}>
    {fields.map(field => (
      <Field key={field.label} label={field.label} IconComponent={field.IconComponent} />
    ))}
  </Grid.Container>
);

export default FieldsList;
