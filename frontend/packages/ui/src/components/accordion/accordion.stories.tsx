import { icos, IcoUserCircle24 } from '@onefootprint/icons';
import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import Typography from '../typography';
import Accordion, { AccordionProps } from './accordion';

export default {
  component: Accordion,
  title: 'Components/Accordion',
  argTypes: {
    iconComponent: {
      control: 'select',
      description: 'Icon to be rendered',
      options: Object.keys(icos),
      name: 'Icon *',
    },
    children: {
      control: 'text',
      description: 'Content to be rendered',
      required: true,
    },
    title: {
      control: 'text',
      description: 'Accordion title',
      required: true,
    },
    open: {
      control: 'boolean',
      description: 'Shows the content of the accordion',
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as Meta;

const Template: Story<AccordionProps> = ({
  children,
  iconComponent: Icon,
  open: initialOpen,
  testID,
  title,
  onChange,
}: AccordionProps) => {
  const [isOpen, setOpen] = useState(initialOpen);
  const SelectedIcon = typeof Icon === 'string' ? icos[Icon] : Icon;

  return (
    <Accordion
      iconComponent={SelectedIcon}
      open={isOpen}
      testID={testID}
      title={title}
      onChange={(event, newOpen) => {
        setOpen(newOpen);
        onChange?.(event, newOpen);
      }}
    >
      {children}
    </Accordion>
  );
};

export const Base = Template.bind({});
Base.args = {
  children: (
    <>
      <Typography color="tertiary" variant="label-3" sx={{ marginBottom: 2 }}>
        Email
      </Typography>
      <Typography color="primary" variant="body-3">
        jane.doe@acme.com
      </Typography>
    </>
  ),
  iconComponent: IcoUserCircle24,
  open: false,
  testID: 'accordion-test-id',
  title: 'Identity',
  onChange: console.log,
};

export const OpenedByDefault = Template.bind({});
OpenedByDefault.args = {
  children: (
    <>
      <Typography color="tertiary" variant="label-3" sx={{ marginBottom: 2 }}>
        Email
      </Typography>
      <Typography color="primary" variant="body-3">
        jane.doe@acme.com
      </Typography>
    </>
  ),
  iconComponent: IcoUserCircle24,
  open: true,
  testID: 'accordion-test-id',
  title: 'Identity',
  onChange: console.log,
};
