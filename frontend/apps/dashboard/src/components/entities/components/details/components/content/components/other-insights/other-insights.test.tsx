import { customRender, mockRouter, screen, waitFor } from '@onefootprint/test-utils';

import OtherInsights from './other-insights';
import { withOtherInsights, withOtherInsightsEmpty, withOtherInsightsError } from './other-insights.test.config';

const id = 'fp_id_yCZehsWNeywHnk5JqL20u';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const renderOtherInsights = () => customRender(<OtherInsights />);

describe('<OtherInsights/>', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/entities');
    mockRouter.query = {
      id,
    };
  });

  const renderOtherInsightsAndWait = async () => {
    renderOtherInsights();
    await waitFor(() => {
      expect(screen.getByText('Other insights')).toBeInTheDocument();
    });
  };

  describe('when the request fails', () => {
    beforeEach(() => {
      withOtherInsightsError();
    });

    it('should render nothing', async () => {
      renderOtherInsights();
      expect(screen.queryByText('Other Insights')).not.toBeInTheDocument();
    });
  });

  describe('when the request succeeds', () => {
    describe('when there are no insights', () => {
      beforeEach(() => {
        withOtherInsightsEmpty();
      });

      it('should render nothing', async () => {
        renderOtherInsightsAndWait();
        expect(screen.queryByText('Other Insights')).not.toBeInTheDocument();
      });
    });

    describe('when there are insights', () => {
      beforeEach(() => {
        withOtherInsights();
      });

      it('should render the insights', async () => {
        await renderOtherInsightsAndWait();

        const onboarding = screen.getByText('Onboarding');
        expect(onboarding).toBeInTheDocument();

        const behavior = screen.getByText('Behavior');
        expect(behavior).toBeInTheDocument();

        const device = screen.getByText('Browser / IP behavior');
        expect(device).toBeInTheDocument();
      });
    });
  });
});
