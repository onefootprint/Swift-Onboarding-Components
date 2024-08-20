import {
  customRender,
  mockRouter,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@onefootprint/test-utils';
import { EntityKind, EntityStatus, OrgFrequentNoteKind } from '@onefootprint/types';
import { withFrequentNotes } from 'src/components/frequent-notes-text-area/frequent-notes-text-area.test.config';

import type { ManualReviewProps } from './manual-review';
import ManualReview from './manual-review';
import { entityFixture, withDecision, withDecisionError, withEntity } from './manual-review.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<ManualReview />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl(`/entities/${entityFixture.id}`);
    mockRouter.query = {
      id: entityFixture.id,
    };
    withEntity(entityFixture.id);
    withFrequentNotes(OrgFrequentNoteKind.ManualReview, []);
  });

  const renderManualReview = ({ status = EntityStatus.pass, kind = EntityKind.person }: Partial<ManualReviewProps>) =>
    customRender(<ManualReview status={status} kind={kind} />);

  describe('when entity is a person', () => {
    it('should render the manual review button', () => {
      renderManualReview({});

      const trigger = screen.getByRole('button', { name: 'Review user' });
      expect(trigger).toBeInTheDocument();
    });

    describe('when reviewing the user', () => {
      it('should display an error message if the form is not valid', async () => {
        renderManualReview({});

        const trigger = screen.getByRole('button', { name: 'Review user' });
        await userEvent.click(trigger);

        const item = screen.getByText('Keep user as Pass');
        await userEvent.click(item);

        await waitFor(() => {
          const dialog = screen.getByRole('dialog', { name: 'Review' });
          expect(dialog).toBeInTheDocument();
        });

        const submit = screen.getByRole('button', { name: 'Complete' });
        await userEvent.click(submit);

        const error = await screen.findByText('A note is required');
        expect(error).toBeInTheDocument();
      });

      describe('when the request to submit a review fails', () => {
        beforeEach(() => {
          withDecisionError(entityFixture.id);
        });

        it('should display an error message', async () => {
          renderManualReview({});

          const trigger = screen.getByRole('button', { name: 'Review user' });
          await userEvent.click(trigger);

          const item = screen.getByText('Keep user as Pass');
          await userEvent.click(item);

          await waitFor(() => {
            const dialog = screen.getByRole('dialog', { name: 'Review' });
            expect(dialog).toBeInTheDocument();
          });

          const note = screen.getByLabelText('Note');
          await userEvent.type(note, 'This is a note');

          const submit = screen.getByRole('button', { name: 'Complete' });
          await userEvent.click(submit);

          await waitFor(() => {
            const error = screen.getByText('Something went wrong');
            expect(error).toBeInTheDocument();
          });
        });
      });

      describe('when the request to submit a review succeeds', () => {
        beforeEach(() => {
          withDecision(entityFixture.id);
        });

        it('should show a feedback toast and close the dialog', async () => {
          renderManualReview({});

          const trigger = screen.getByRole('button', { name: 'Review user' });
          await userEvent.click(trigger);

          const item = screen.getByText('Keep user as Pass');
          await userEvent.click(item);

          await waitFor(() => {
            const dialog = screen.getByRole('dialog', { name: 'Review' });
            expect(dialog).toBeInTheDocument();
          });

          const dialog = screen.getByRole('dialog', { name: 'Review' });

          const note = screen.getByRole('textbox', { name: 'Note' });
          await userEvent.type(note, 'This is a note');

          const submit = screen.getByRole('button', { name: 'Complete' });
          await userEvent.click(submit);

          await waitForElementToBeRemoved(dialog);
          await waitFor(() => {
            const feedback = screen.getByText('Review submitted successfully');
            expect(feedback).toBeInTheDocument();
          });
        });
      });
    });
  });

  describe('when entity is a business', () => {
    it('should render the manual review button', () => {
      renderManualReview({
        kind: EntityKind.business,
      });

      const trigger = screen.getByRole('button', { name: 'Review business' });
      expect(trigger).toBeInTheDocument();
    });
  });
});
