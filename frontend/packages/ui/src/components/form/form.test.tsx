import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../utils/test-utils';
import Form from './form';
import '@testing-library/jest-dom';

describe('Form.Field', () => {
  it('should focus input when label is clicked and input is enabled', async () => {
    customRender(
      <form>
        <Form.Field>
          <Form.Label htmlFor="test-input">Test Label</Form.Label>
          <Form.Input placeholder="test" id="test-input" />
        </Form.Field>
        <Form.Field>
          <Form.Label htmlFor="test-input-2">Test Label 2</Form.Label>
          <Form.Input placeholder="test" id="test-input-2" />
        </Form.Field>
      </form>,
    );

    const label = screen.getByText('Test Label');
    const input = screen.getByLabelText('Test Label');

    await userEvent.click(label);
    expect(input).toHaveFocus();
  });

  it('should not focus input when label is clicked and input is disabled', async () => {
    customRender(
      <form>
        <Form.Field>
          <Form.Label htmlFor="test-input">Test Label</Form.Label>
          <Form.Input placeholder="test" id="test-input" disabled />
        </Form.Field>
      </form>,
    );

    const label = screen.getByText('Test Label');
    const input = screen.getByLabelText('Test Label');

    await userEvent.click(label);
    expect(input).not.toHaveFocus();
  });
});
