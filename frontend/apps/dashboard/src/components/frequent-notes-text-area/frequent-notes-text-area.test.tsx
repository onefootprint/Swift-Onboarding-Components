import { customRender, screen } from '@onefootprint/test-utils';
import { OrgFrequentNoteKind } from '@onefootprint/types';
import { asAdminUser } from 'src/config/tests';

import {
  Form,
  withCreateFrequentNote,
  withDeleteFrequentNote,
  withFrequentNotes,
} from './frequent-notes-text-area.test.config';

const firstNote = {
  id: 'fn_BB3U3i9SwGyCAQRGuvSbkn',
  kind: OrgFrequentNoteKind.Annotation,
  content: 'this is the first note',
};

const secondNote = {
  id: 'fn_9U599NMWFsoqrAnCHSuvO7',
  kind: OrgFrequentNoteKind.Annotation,
  content: 'this is the second note',
};

const thirdNote = {
  id: 'fn_2RtPi7VtI10WaNLtkSVv83',
  kind: OrgFrequentNoteKind.Annotation,
  content: 'this is the third note',
};

const initialNotes = [firstNote, secondNote];
const notesWithThirdNote = [...initialNotes, thirdNote];

describe('FrequentNotesTextArea', () => {
  beforeEach(() => {
    asAdminUser();
  });
  describe('when loading notes', () => {
    it('should display existing notes', async () => {
      withFrequentNotes(OrgFrequentNoteKind.Annotation, initialNotes);

      customRender(<Form />);

      expect(await screen.findByText('this is the first note')).toBeInTheDocument();
      expect(await screen.findByText('this is the second note')).toBeInTheDocument();
    });
  });
  describe('when deleting a note', () => {
    it('should delete the note', async () => {
      withFrequentNotes(OrgFrequentNoteKind.Annotation, notesWithThirdNote);
      withDeleteFrequentNote(secondNote.id);
      withFrequentNotes(OrgFrequentNoteKind.Annotation, [firstNote, thirdNote]);

      customRender(<Form />);

      expect(await screen.findByText('this is the first note')).toBeInTheDocument();
      expect(await screen.findByText('this is the third note')).toBeInTheDocument();
      expect(await screen.queryByText('this is the second note')).not.toBeInTheDocument();
    });
  });

  describe('when creating a note', () => {
    it('should create the note', async () => {
      withCreateFrequentNote(firstNote);
      withFrequentNotes(OrgFrequentNoteKind.Annotation, [firstNote]);

      customRender(<Form />);

      expect(await screen.findByText('this is the first note')).toBeInTheDocument();
    });
  });
});
