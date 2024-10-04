import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const apply = async ({
  options,
  trigger,
}: {
  trigger: string;
  options: string[];
}) => {
  const triggerButton = screen.getByRole('button', { name: trigger });
  await userEvent.click(triggerButton);

  const popover = await waitFor(() => screen.getByRole('dialog', { name: `Filter by ${trigger}` }));

  const clickChoice = async (choice: string) => {
    const inputField = within(popover).getByLabelText(choice);
    await userEvent.click(inputField);
  };

  for (const choice of options) {
    await clickChoice(choice);
  }

  const apply = screen.getByRole('button', { name: 'Apply' });
  expect(apply).toBeInTheDocument();
  await userEvent.click(apply);
};

const filterEvents = {
  apply,
};

export default filterEvents;
