import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import Button from '../../../../button';
import Picker from './picker';

const meta: Meta<typeof Picker> = {
  title: 'Internal/Picker',
  component: Picker,
  parameters: {
    layout: 'centered',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Picker>;

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

const MobileWrapper = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? <>{children}</> : <div>This component is only visible on mobile devices.</div>;
};

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<(typeof options)[0] | undefined>(undefined);

    return (
      <MobileWrapper>
        <Button onClick={() => setIsOpen(true)}>Open Picker</Button>
        <Picker
          open={isOpen}
          onClose={() => setIsOpen(false)}
          height={300}
          id="default-picker"
          placeholder="Search options..."
          options={options}
          value={selectedValue}
          renderEmptyState={() => <div>No options found</div>}
          onChange={newValue => {
            setSelectedValue(newValue);
            setIsOpen(false);
          }}
        />
      </MobileWrapper>
    );
  },
};

export const WithPreselectedValue: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(options[1]);

    return (
      <MobileWrapper>
        <Button onClick={() => setIsOpen(true)}>Open Picker</Button>
        <Picker
          open={isOpen}
          onClose={() => setIsOpen(false)}
          height={300}
          id="preselected-picker"
          placeholder="Search options..."
          options={options}
          value={selectedValue}
          renderEmptyState={() => <div>No options found</div>}
          onChange={newValue => {
            setSelectedValue(newValue);
            setIsOpen(false);
          }}
        />
      </MobileWrapper>
    );
  },
};

export const CustomHeight: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<(typeof options)[0] | undefined>(undefined);

    return (
      <MobileWrapper>
        <Button onClick={() => setIsOpen(true)}>Open Picker</Button>
        <Picker
          open={isOpen}
          onClose={() => setIsOpen(false)}
          height={500}
          id="custom-height-picker"
          placeholder="Search options..."
          options={options}
          value={selectedValue}
          renderEmptyState={() => <div>No options found</div>}
          onChange={newValue => {
            setSelectedValue(newValue);
            setIsOpen(false);
          }}
        />
      </MobileWrapper>
    );
  },
};
