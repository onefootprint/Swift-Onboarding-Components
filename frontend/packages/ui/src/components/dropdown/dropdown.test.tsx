import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Dropdown from './dropdown';

describe('Dropdown Component', () => {
  it('should render the Dropdown Trigger', () => {
    render(
      <Dropdown.Root>
        <Dropdown.Trigger>Open Dropdown</Dropdown.Trigger>
      </Dropdown.Root>,
    );
    expect(screen.getByText('Open Dropdown')).toBeInTheDocument();
  });

  it('should open the Dropdown Content when Trigger is clicked', () => {
    render(
      <Dropdown.Root>
        <Dropdown.Trigger>Open Dropdown</Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content>
            <Dropdown.Item>Item 1</Dropdown.Item>
            <Dropdown.Item>Item 2</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>,
    );

    fireEvent.click(screen.getByText('Open Dropdown'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should close the Dropdown Content when clicking outside', () => {
    render(
      <Dropdown.Root>
        <Dropdown.Trigger>Open Dropdown</Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content>
            <Dropdown.Item>Item 1</Dropdown.Item>
            <Dropdown.Item>Item 2</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>,
    );

    fireEvent.click(screen.getByText('Open Dropdown'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    fireEvent.mouseDown(document);
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('should call onSelect when an item is selected', () => {
    const handleSelect = jest.fn();
    render(
      <Dropdown.Root>
        <Dropdown.Trigger>Open Dropdown</Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content>
            <Dropdown.Item onSelect={handleSelect}>Item 1</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>,
    );

    fireEvent.click(screen.getByText('Open Dropdown'));
    fireEvent.click(screen.getByText('Item 1'));
    expect(handleSelect).toHaveBeenCalled();
  });
});
