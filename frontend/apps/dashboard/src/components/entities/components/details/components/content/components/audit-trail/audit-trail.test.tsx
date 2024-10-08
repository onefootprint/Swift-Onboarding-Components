import { customRender, screen, userEvent, waitFor, within } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import { asAdminUser, resetUser } from 'src/config/tests';

import { AUDIT_TRAILS_ID } from '@/entity/constants';

import AuditTrail from './audit-trail';
import mockFrequentNotes from './audit-trail.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<AuditTrail />', () => {
  beforeEach(() => {
    mockFrequentNotes();
    asAdminUser();
  });

  afterAll(() => {
    resetUser();
  });

  const renderAuditTrail = () => customRender(<AuditTrail />);

  describe('when timeline data is loaded', () => {
    const userId = 'fp_id_yCZehsWNeywHnk5JqL20u';

    beforeAll(() => {
      mockRouter.setCurrentUrl('/users/detail');
      mockRouter.query = {
        footprint_user_id: userId,
      };
    });

    it('should open the dialog when user clicks the add note button', async () => {
      renderAuditTrail();
      const section = screen.getByTestId(AUDIT_TRAILS_ID);
      expect(section).toBeInTheDocument();
      const addNoteButton = within(section).getByText('Add note');
      expect(addNoteButton).toBeInTheDocument();
      await userEvent.click(addNoteButton);
      await waitFor(() => {
        const dialogue = screen.getByRole('dialog');
        expect(dialogue).toBeInTheDocument();
      });
    });
  });
});
