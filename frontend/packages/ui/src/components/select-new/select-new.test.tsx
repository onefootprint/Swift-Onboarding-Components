import '../../config/initializers/i18next-test';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../utils/test-utils';

import SelectNew from './select-new';
import type { SelectNewProps } from './select-new.types';

const renderSelectNew = (onChange?: SelectNewProps['onChange']) => {
  const defaultProps: SelectNewProps = {
    options: [
      { value: 'option1', label: 'Option 1' },
      {
        value: 'option2',
        label: 'Option 2',
        disabled: true,
        disabledTooltipText: 'disabled tooltip text',
      },
      { value: 'option3', label: 'Option 3' },
    ],
    placeholder: 'Select option',
    onChange,
  };

  // eslint-disable-next-line react/jsx-props-no-spreading
  return customRender(<SelectNew {...defaultProps} />);
};

describe('<SelectNew />', () => {
  it('select should open and show the options when clicked', async () => {
    renderSelectNew();
    const select = screen.getByLabelText('select');
    await userEvent.click(select);

    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(3);
  });

  it('should show a placeholder when empty', async () => {
    renderSelectNew();
    const placeholder = await screen.findByText('Select option');
    expect(placeholder).toBeInTheDocument();
  });

  it('should show the selected option', async () => {
    renderSelectNew();
    const select = screen.getByLabelText('select');
    await userEvent.click(select);

    const option = await screen.findByText('Option 1');
    await userEvent.click(option);

    const selectedOption = await screen.findByText('Option 1');
    expect(selectedOption).toBeInTheDocument();
  });

  it('should show the disabled option', async () => {
    renderSelectNew();
    const select = screen.getByLabelText('select');
    await userEvent.click(select);

    const disabledOption = await screen.findByText('Option 2');
    expect(disabledOption).toBeInTheDocument();
  });

  it('should show the disabled tooltip text when hovering over the info icon of the option', async () => {
    renderSelectNew();
    const select = screen.getByLabelText('select');
    await userEvent.click(select);

    const infoIcon = await screen.findByLabelText('tooltip-help');
    await userEvent.hover(infoIcon);

    const tooltip = await screen.findByText('disabled tooltip text', {
      selector: 'span',
    });
    expect(tooltip).toBeInTheDocument();
  });

  it('should call onChange prop when an option is selected', async () => {
    const onChangeMock = jest.fn();
    renderSelectNew(onChangeMock);
    const select = screen.getByLabelText('select');
    await userEvent.click(select);

    const option = await screen.findByText('Option 1');
    await userEvent.click(option);

    expect(onChangeMock).toHaveBeenCalledWith('option1');
  });
});
