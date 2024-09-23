import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import Command from './command';

describe('Command Component', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnSelect = jest.fn();

  const TestComponent = () => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState('');

    return (
      <>
        <Command.Shortcut baseKey="Meta" ctrlKey="k" onShortcut={() => setOpen(true)} onClose={() => setOpen(false)} />
        <Command.Container
          open={open}
          onOpenChange={newOpen => {
            setOpen(newOpen);
            mockOnOpenChange(newOpen);
          }}
        >
          <Command.Input value={value} onValueChange={setValue} />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>
            <Command.Group heading="Fruits">
              <Command.Item value="apple" onSelect={() => mockOnSelect('apple')}>
                Apple
              </Command.Item>
              <Command.Item value="banana" onSelect={() => mockOnSelect('banana')}>
                Banana
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command.Container>
      </>
    );
  };

  it('renders Command component', () => {
    render(<TestComponent />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('opens and closes the Command dialog', () => {
    render(<TestComponent />);
    const input = screen.getByRole('combobox');

    fireEvent.focus(input);
    expect(mockOnOpenChange).toHaveBeenCalledWith(true);

    fireEvent.blur(input);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('filters items based on input', () => {
    render(<TestComponent />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'app' } });
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('shows "No results found" when no items match', () => {
    render(<TestComponent />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'xyz' } });
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('calls onSelect when an item is selected', () => {
    render(<TestComponent />);
    const appleItem = screen.getByText('Apple');

    fireEvent.click(appleItem);
    expect(mockOnSelect).toHaveBeenCalledWith('apple');
  });

  it('calls onErase when the erase button is clicked', () => {
    render(<TestComponent />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'xyz' } });
    fireEvent.click(screen.getByLabelText('erase-search'));
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('calls onErase when the escape key is pressed', () => {
    render(<TestComponent />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'xyz' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('opens the Command dialog when the shortcut is pressed', () => {
    render(<TestComponent />);
    const input = screen.getByRole('combobox');

    fireEvent.keyDown(input, { key: 'Meta', code: 'MetaLeft' });
    fireEvent.keyDown(input, { key: 'k' });
    expect(mockOnOpenChange).toHaveBeenCalledWith(true);
  });
});
