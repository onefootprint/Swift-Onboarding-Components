import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import Button from '../button';
import Stack from '../stack';
import Text from '../text';
import Combo from './combo';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date', disabled: true },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew' },
  { value: 'kiwi', label: 'Kiwi' },
  { value: 'lemon', label: 'Lemon' },
  { value: 'mango', label: 'Mango' },
  { value: 'nectarine', label: 'Nectarine' },
];

const ComboComponent = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <Combo.Root open={open} onOpenChange={setOpen}>
      <Stack width="100vw" height="100vh" align="center" justify="center">
        <Combo.Trigger asChild>
          <Button type="button" variant="secondary">
            <Text variant="label-1">{value || 'Select fruit'}</Text>
          </Button>
        </Combo.Trigger>
      </Stack>
      <Combo.Portal>
        <Combo.Content>
          <Combo.Input />
          <Combo.List emptyText="No fruit found">
            <Combo.Group>
              {fruits.map(fruit => (
                <Combo.Item
                  key={fruit.value}
                  value={fruit.value}
                  disabled={fruit.disabled}
                  onSelect={currentValue => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  {fruit.label}
                </Combo.Item>
              ))}
            </Combo.Group>
          </Combo.List>
        </Combo.Content>
      </Combo.Portal>
    </Combo.Root>
  );
};

describe('Combo component', () => {
  const setup = () => {
    const utils = render(<ComboComponent />);
    return {
      ...utils,
      triggerButton: screen.getByText('Select fruit'),
    };
  };

  test('renders Combo component', () => {
    const { triggerButton } = setup();
    expect(triggerButton).toBeInTheDocument();
  });

  test('opens combo on trigger click', async () => {
    const { triggerButton } = setup();
    await userEvent.click(triggerButton);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('displays all non-disabled items', async () => {
    const { triggerButton } = setup();
    await userEvent.click(triggerButton);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  test('disabled items are not selectable', async () => {
    const { triggerButton } = setup();
    await userEvent.click(triggerButton);
    const disabledItem = screen.getByText('Cherry');
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
  });

  test('filters items based on input', async () => {
    const { triggerButton } = setup();
    await userEvent.click(triggerButton);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'app');
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  test('selects item on click', async () => {
    const { triggerButton } = setup();
    await userEvent.click(triggerButton);
    await userEvent.click(screen.getByText('Apple'));
    expect(triggerButton).toHaveTextContent('Apple');
  });

  test('closes combo on item selection', async () => {
    const { triggerButton } = setup();
    await userEvent.click(triggerButton);
    await userEvent.click(screen.getByText('Apple'));
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
