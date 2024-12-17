import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
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
    <div className="flex flex-col gap-2">
      <span className="text-label-3">{title}</span>
      <div className="flex flex-col gap-1 flex-1">
        {fields.map(({ di }) => (
          <Field key={di} di={di} useField={useField} />
        ))}
      </div>
    </div>
  );
};

export default Fieldset;
