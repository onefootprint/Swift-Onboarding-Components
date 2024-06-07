import '../../config/initializers/i18next-test';

import { IcoArrowRightSmall24 } from '@onefootprint/icons';
import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import type { EmptyStateProps } from './empty-state';
import EmptyState from './empty-state';

describe('<EmptyState />', () => {
  const renderEmptyState = ({
    cta = { label: 'cta', onClick: () => undefined },
    description = 'warning',
    iconComponent,
    renderHeader,
    testID,
    title = 'banner content',
  }: Partial<EmptyStateProps>) =>
    customRender(
      // Types won't work well in this case, as the component
      // do not accept renderHeader and iconComponent at the same time
      // @ts-ignore
      <EmptyState
        cta={cta}
        description={description}
        iconComponent={iconComponent}
        renderHeader={renderHeader}
        testID={testID}
        title={title}
      />,
    );

  it('should render the title', () => {
    renderEmptyState({ title: "Oops! User couldn't be found." });

    expect(screen.getByText("Oops! User couldn't be found.")).toBeInTheDocument();
  });

  it('should render the description', () => {
    renderEmptyState({
      description: "We're sorry, but it looks like the user you're looking for doesn't exist.",
    });

    expect(
      screen.getByText("We're sorry, but it looks like the user you're looking for doesn't exist."),
    ).toBeInTheDocument();
  });

  it('should trigger onClick when clicking on the cta', async () => {
    const onClickMockFn = jest.fn();
    renderEmptyState({
      cta: {
        label: 'Go back',
        onClick: onClickMockFn,
      },
    });
    const cta = screen.getByText('Go back');
    await userEvent.click(cta);

    await waitFor(() => {
      expect(onClickMockFn).toHaveBeenCalled();
    });
  });

  describe('when passing an Icon', () => {
    it('should render the Icon', () => {
      renderEmptyState({
        iconComponent: IcoArrowRightSmall24,
        testID: 'empty-state',
      });

      expect(screen.getByTestId('empty-state')).toContainHTML('svg');
    });
  });

  describe('when rendering the header', () => {
    it('should render the header', () => {
      renderEmptyState({
        renderHeader: () => <div>foo</div>,
      });

      expect(screen.getByText('foo')).toBeInTheDocument();
    });
  });
});
