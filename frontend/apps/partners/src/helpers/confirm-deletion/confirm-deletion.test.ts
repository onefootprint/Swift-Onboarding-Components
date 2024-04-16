import { describe, expect, it, mock } from 'bun:test';

import confirmDeletion from './confirm-deletion';

// @ts-ignore: dump translation function
const t: TFunction<'common'> = x => x;

describe('confirmDeletion', () => {
  it('should call openConfirm with correct parameters', () => {
    /** @ts-ignore: mock does not have the correct type */
    const openConfirmMock = mock();
    /** @ts-ignore: mock does not have the correct type */
    const yesFnMock = mock();
    const evMock = {} as Event;

    confirmDeletion(t, openConfirmMock)(yesFnMock)(evMock);

    expect(openConfirmMock).toHaveBeenCalledWith({
      title: 'are-you-sure',
      description: 'cannot-be-undone',
      primaryButton: { label: 'yes', onClick: expect.any(Function) },
      secondaryButton: { label: 'no' },
    });
  });

  it('should call the onClick function correctly', () => {
    /** @ts-ignore: mock does not have the correct type */
    const openConfirmMock = mock();
    /** @ts-ignore: mock does not have the correct type */
    const yesFnMock = mock();
    const evMock = {} as Event;

    confirmDeletion(t, openConfirmMock)(yesFnMock)(evMock);

    const onYesClick = openConfirmMock.mock.calls[0][0].primaryButton.onClick;
    onYesClick();

    expect(yesFnMock).toHaveBeenCalledWith(evMock);
  });
});
