import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import PinnedNote, { PinnedNoteProps } from './pinned-note';

describe('<PinnedNote />', () => {
  const renderPinnedNote = ({ author, note }: PinnedNoteProps) =>
    customRender(<PinnedNote author={author} note={note} />);

  it('should render the note correctly', () => {
    renderPinnedNote({ note: 'Lorem ipsum dolor simet at magna' });
    const note = screen.getByText('Lorem ipsum dolor simet at magna');
    expect(note).toBeInTheDocument();
  });

  it('should render the author correctly', () => {
    renderPinnedNote({
      note: 'Lorem ipsum dolor simet at magna',
      author: 'jane.doe@acme.com',
    });
    const author = screen.getByText('Pinned note from jane.doe@acme.com');
    expect(author).toBeInTheDocument();
  });
});
