import * as storybook from '@storybook/test';
export { expect, fn, waitFor, waitForElementToBeRemoved, within, spyOn } from '@storybook/test';

export const userEvent = storybook.userEvent.setup({ delay: 100 });
