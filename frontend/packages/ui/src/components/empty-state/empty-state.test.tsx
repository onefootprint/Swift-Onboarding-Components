import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';

import EmptyState, { EmptyStateProps } from './empty-state';

describe('<EmptyState />', () => {
  const renderEmptyState = ({
    title = 'banner content',
    description = 'warning',
    cta = {
      label: 'cta',
      onClick: () => {},
    },
    renderImage,
  }: Partial<EmptyStateProps>) =>
    customRender(
      <EmptyState
        title={title}
        description={description}
        cta={cta}
        renderImage={renderImage}
      />,
    );

  it('should render the title', () => {
    renderEmptyState({ title: "Oops! User couldn't be found." });
    expect(
      screen.getByText("Oops! User couldn't be found."),
    ).toBeInTheDocument();
  });

  it('should render the description', () => {
    renderEmptyState({
      description:
        "We're sorry, but it looks like the user you're looking for doesn't exist.",
    });
    expect(
      screen.getByText(
        "We're sorry, but it looks like the user you're looking for doesn't exist.",
      ),
    ).toBeInTheDocument();
  });

  describe('when clicking on the cta', () => {
    it('should trigger onClick', async () => {
      const onClickMockFn = jest.fn();
      renderEmptyState({
        cta: {
          label: 'Go back',
          onClick: onClickMockFn,
        },
      });
      const cta = screen.getByText('Go back');
      await userEvent.click(cta);
      expect(onClickMockFn).toHaveBeenCalled();
    });
  });
});
