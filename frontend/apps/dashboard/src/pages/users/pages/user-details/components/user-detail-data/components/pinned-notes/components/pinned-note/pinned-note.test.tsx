import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import PinnedNote, { PinnedNoteProps } from './pinned-note';

describe('<PinnedNote />', () => {
  const renderPinnedNote = ({ author, note }: PinnedNoteProps) =>
    customRender(<PinnedNote author={author} note={note} />);

  it('renders note correctly', () => {
    renderPinnedNote({ note: 'Some note' });
    const note = screen.getByText('Some note');
    expect(note).toBeInTheDocument();
  });

  it('renders author correctly', () => {
    renderPinnedNote({
      note: 'Some note',
      author: 'belce@onefootprint.com',
    });
    expect(
      screen.getByText('Pinned note from belce@onefootprint.com'),
    ).toBeInTheDocument();
    expect(screen.getByText('Some note')).toBeInTheDocument();
  });
});
