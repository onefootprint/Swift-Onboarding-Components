import { expect, it, mock } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import InnerButton from './inner-button';

it('should render the inner button with functional click event', async () => {
  const btnClickMock = mock(() => undefined);
  render(<InnerButton className="loren-ipsum" label="causticais" onClick={btnClickMock} testID="97eb9186" />);

  const btn = screen.getByText('causticais');
  expect(btn).toBeTruthy();
  expect(btn.className).toEqual('loren-ipsum');
  expect(btn.dataset.testid).toEqual('97eb9186');

  await userEvent.click(btn);
  expect(btnClickMock).toHaveBeenCalledTimes(1);
});
