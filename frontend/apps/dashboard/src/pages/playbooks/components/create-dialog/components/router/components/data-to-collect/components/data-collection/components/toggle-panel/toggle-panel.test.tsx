import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';
import TogglePanel, { TogglePanelProps } from './toggle-panel';

const defaultProps: TogglePanelProps = {
  children: <div>Child content</div>,
  onAdd: jest.fn(),
  onRemove: jest.fn(),
  subtitle: 'Subtitle text',
  title: 'Title text',
  value: false,
};

const renderComponent = (props: Partial<TogglePanelProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return customRender(<TogglePanel {...combinedProps} />);
};

describe('<TogglePanel />', () => {
  it('should render the title', () => {
    renderComponent({ title: 'Investor profile questions' });
    expect(screen.getByText('Investor profile questions')).toBeInTheDocument();
  });

  describe('when the value is false', () => {
    it('should render the subtitle', () => {
      renderComponent({
        value: false,
        subtitle: 'You are required to ask investor profile questions.',
      });
      expect(screen.getByText('You are required to ask investor profile questions.')).toBeInTheDocument();
    });

    it('should render the add button', () => {
      renderComponent({ value: false });

      const button = screen.getByRole('button', { name: 'Add' });
      expect(button).toBeInTheDocument();
    });

    it('should trigger onAdd when add button is clicked', async () => {
      const onAdd = jest.fn();
      renderComponent({ onAdd, value: false });

      const button = screen.getByRole('button', { name: 'Add' });
      await userEvent.click(button);
      expect(onAdd).toHaveBeenCalled();
    });
  });

  describe('when the value is true', () => {
    it('should render children', () => {
      renderComponent({ value: true });
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should render the remove button', () => {
      renderComponent({ value: true });
      const button = screen.getByRole('button', { name: 'Remove' });
      expect(button).toBeInTheDocument();
    });

    it('should trigger onRemove when remove button is clicked', async () => {
      const onRemove = jest.fn();
      renderComponent({ onRemove, value: true });

      const button = screen.getByRole('button', { name: 'Remove' });
      await userEvent.click(button);
      expect(onRemove).toHaveBeenCalled();
    });
  });
});
