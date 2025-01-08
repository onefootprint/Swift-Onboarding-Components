import type { Icon } from '@onefootprint/icons';

import type { WithEntityProps } from '@/entity/components/with-entity';
import type { DataIdentifier } from '@onefootprint/types';
import EditField from '../edit-field';

export type EditFieldsetProps = WithEntityProps & {
  fields: DataIdentifier[];
  iconComponent: Icon;
  title: string;
};

const EditFieldset = ({ entity, fields, iconComponent: IconComponent, title }: EditFieldsetProps) => {
  return (
    <fieldset
      className="flex flex-col justify-between h-full w-full border border-solid border-tertiary rounded"
      aria-label={title}
    >
      <header className="flex justify-between py-2 px-4 bg-secondary border-b border-solid border-tertiary rounded-t">
        <div className="flex items-center gap-2">
          <IconComponent />
          <h2 className="text-label-2">{title}</h2>
        </div>
      </header>
      <div className="flex flex-col gap-3 p-4 flex-1">
        {fields.map(di => (
          <EditField key={di} di={di} entity={entity} />
        ))}
      </div>
    </fieldset>
  );
};

export default EditFieldset;
