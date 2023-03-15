import {
  screen,
  act,
  fireEvent,
  within,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const apply = async ({
  option,
  trigger,
}: {
  trigger: string;
  option: string;
}) => {
  const triggerButton = screen.getByRole('button', { name: trigger });
  await userEvent.click(triggerButton);

  await waitFor(() => {
    const popover = screen.getByRole('dialog', { name: trigger });
    expect(popover).toBeInTheDocument();
  });

  const popover = screen.getByRole('dialog', { name: trigger });
  const inputField = within(popover).getByLabelText(option);
  await userEvent.click(inputField);

  const applyButton = within(popover).getByRole('button', { name: 'Apply' });
  await userEvent.click(applyButton);
};

const filterEvents = {
  apply,
};

export default filterEvents;
