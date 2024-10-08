import { screen, act, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const openMenu = async (trigger: HTMLElement) => {
  act(() => {
    fireEvent.click(trigger);
  });
  const testID = trigger.getAttribute('data-testid');
  const select = await screen.findByTestId(`select-${testID}`);
  if (!select) {
    throw new Error('Select not found');
  }
  return select as HTMLElement;
};

const search = async (trigger: HTMLElement, search: string) => {
  const select = await openMenu(trigger);
  const searchInput = within(select).getByDisplayValue('');
  await userEvent.type(searchInput, search);
};

const select = async (trigger: HTMLElement, optionLabel: string) => {
  const select = await openMenu(trigger);
  act(() => {
    const option = within(select).getByRole('option', { name: optionLabel });
    fireEvent.click(option);
  });
};

const selectEvents = {
  openMenu,
  search,
  select,
};

export default selectEvents;
