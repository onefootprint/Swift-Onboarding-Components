import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { OrgFrequentNoteKind } from '@onefootprint/types';
import React from 'react';
import { asAdminUser } from 'src/config/tests';

import {
  Form,
  withCreateFrequentNote,
  withDeleteFrequentNote,
  withFrequentNotes,
} from './frequent-notes-text-area.test.config';

describe('<FrequentNotesTextArea />', () => {
  describe('when rendering', () => {
    beforeEach(() => {
      asAdminUser();
    });

    it('should make a GET API call on initial render', async () => {
      customRender(<Form />);

      withFrequentNotes(
        OrgFrequentNoteKind.Annotation,
        [
          {
            id: 'fn_BB3U3i9SwGyCAQRGuvSbkn',
            kind: OrgFrequentNoteKind.Annotation,
            content: 'this is the first note',
          },
          {
            id: 'fn_9U599NMWFsoqrAnCHSuvO7',
            kind: OrgFrequentNoteKind.Annotation,
            content: 'this is the second note',
          },
        ],
        true,
      );

      await waitFor(() => {
        expect(screen.getByText('this is the first note')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('this is the second note')).toBeInTheDocument();
      });
    });

    it('should make a POST API call upon submission', async () => {
      customRender(<Form />);

      withFrequentNotes(
        OrgFrequentNoteKind.Annotation,
        [
          {
            id: 'fn_BB3U3i9SwGyCAQRGuvSbkn',
            kind: OrgFrequentNoteKind.Annotation,
            content: 'this is the first note',
          },
          {
            id: 'fn_9U599NMWFsoqrAnCHSuvO7',
            kind: OrgFrequentNoteKind.Annotation,
            content: 'this is the second note',
          },
        ],
        true,
      );

      await waitFor(() => {
        expect(screen.getByText('this is the first note')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('this is the second note')).toBeInTheDocument();
      });

      withCreateFrequentNote({
        id: 'fn_2RtPi7VtI10WaNLtkSVv83',
        kind: OrgFrequentNoteKind.Annotation,
        content: 'this is the third note',
      });
      withFrequentNotes(
        OrgFrequentNoteKind.Annotation,
        [
          {
            id: 'fn_BB3U3i9SwGyCAQRGuvSbkn',
            kind: OrgFrequentNoteKind.Annotation,
            content: 'this is the first note',
          },
          {
            id: 'fn_9U599NMWFsoqrAnCHSuvO7',
            kind: OrgFrequentNoteKind.Annotation,
            content: 'this is the second note',
          },
          {
            id: 'fn_2RtPi7VtI10WaNLtkSVv83',
            kind: OrgFrequentNoteKind.Annotation,
            content: 'this is the third note',
          },
        ],
        true,
      );

      const firstInput = screen.getByLabelText('Note');
      await userEvent.type(firstInput, 'this is the third note');
      const saveButton = screen.getByRole('button', {
        name: 'Add to frequent notes',
      });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('this is the third note')).toBeInTheDocument();
      });
    });

    it('should make a DELETE API call upon deletion', async () => {
      customRender(<Form />);

      withFrequentNotes(
        OrgFrequentNoteKind.Annotation,
        [
          {
            id: 'fn_BB3U3i9SwGyCAQRGuvSbkn',
            kind: OrgFrequentNoteKind.Annotation,
            content: 'this is the first note',
          },
          {
            id: 'fn_9U599NMWFsoqrAnCHSuvO7',
            kind: OrgFrequentNoteKind.Annotation,
            content: 'this is the second note',
          },
          {
            id: 'fn_2RtPi7VtI10WaNLtkSVv83',
            kind: OrgFrequentNoteKind.Annotation,
            content: 'this is the third note',
          },
        ],
        true,
      );

      await waitFor(() => {
        expect(screen.getByText('this is the first note')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('this is the second note')).toBeInTheDocument();
      });

      withDeleteFrequentNote('fn_9U599NMWFsoqrAnCHSuvO7');
      withFrequentNotes(
        OrgFrequentNoteKind.Annotation,
        [
          {
            id: 'fn_BB3U3i9SwGyCAQRGuvSbkn',
            kind: OrgFrequentNoteKind.Annotation,
            content: 'this is the first note',
          },
          {
            id: 'fn_2RtPi7VtI10WaNLtkSVv83',
            kind: OrgFrequentNoteKind.Annotation,
            content: 'this is the third note',
          },
        ],
        true,
      );

      const editButton = screen.getByRole('button', { name: 'Edit' });
      await userEvent.click(editButton);

      const secondNote = screen.getByText('this is the second note');
      await userEvent.click(secondNote);

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      await userEvent.click(deleteButton);
    });
  });
});
