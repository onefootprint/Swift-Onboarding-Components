import '../../config/initializers/i18next-test';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../utils/test-utils';

import type { InlineAlertProps } from './inline-alert';
import InlineAlert from './inline-alert';

describe('<InlineAlert />', () => {
  const renderInlineAlert = ({ cta, children = 'alert content', variant = 'warning' }: Partial<InlineAlertProps>) =>
    customRender(
      <InlineAlert variant={variant} cta={cta}>
        {children}
      </InlineAlert>,
    );

  it('should assign a role alert', () => {
    renderInlineAlert({ children: 'alert content' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render the text', () => {
    renderInlineAlert({ children: 'alert content' });
    expect(screen.getByText('alert content')).toBeInTheDocument();
  });

  describe('when there is a cta', () => {
    it('should render the cta', () => {
      renderInlineAlert({
        cta: {
          label: 'Dismiss',
          onClick: jest.fn(),
        },
      });
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });

    describe('when clicking on the cta', () => {
      it('should call the onClick function', async () => {
        const onClick = jest.fn();
        renderInlineAlert({
          cta: {
            label: 'Dismiss',
            onClick,
          },
        });
        await userEvent.click(screen.getByText('Dismiss'));
        expect(onClick).toHaveBeenCalled();
      });
    });
  });
});
