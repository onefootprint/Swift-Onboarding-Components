import { Icon } from '@onefootprint/icons';
import { LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import DataSection from '../../../data-section';
import Field from '../field';

type SectionProps = {
  fields: any[];
  footer?: React.ReactNode;
  iconComponent: Icon;
  showCta: boolean;
  title: string;
};

const Section = ({
  fields,
  footer,
  iconComponent,
  showCta,
  title,
}: SectionProps) => {
  const { setValue } = useFormContext();
  const allChecked = fields
    .filter(field => field.canSelect)
    .every(field => field.checked);

  const selectValue = (value: boolean) => {
    fields
      .filter(field => field.canSelect)
      .forEach(field => setValue(field.name, value));
  };

  const handleDeselectAll = () => {
    selectValue(false);
  };

  const handleSelectAll = () => {
    selectValue(true);
  };

  const renderCta = () =>
    showCta ? (
      <LinkButton
        onClick={allChecked ? handleDeselectAll : handleSelectAll}
        size="compact"
      >
        {allChecked ? 'Deselect all' : 'Select all'}
      </LinkButton>
    ) : null;

  return (
    <DataSection
      footer={footer}
      iconComponent={iconComponent}
      renderCta={renderCta}
      title={title}
    >
      {fields.map(field => (
        <Field
          canAccess={field.canAccess}
          canSelect={field.canSelect}
          hasValue={field.hasValue}
          hasPermission={field.hasPermission}
          isDataDecrypted={field.isDataDecrypted}
          key={field.name}
          label={field.label}
          name={field.name}
          showCheckbox={field.showCheckbox}
          value={field.value}
        />
      ))}
    </DataSection>
  );
};

export default Section;
