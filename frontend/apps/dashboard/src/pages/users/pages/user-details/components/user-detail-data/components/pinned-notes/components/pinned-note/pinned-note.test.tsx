import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import PinnedNote, { PinnedNoteProps } from './pinned-note';

describe('<PinnedNote />', () => {
  const renderPinnedNote = ({ reason, author, note }: PinnedNoteProps) =>
    customRender(<PinnedNote reason={reason} author={author} note={note} />);

  it('renders title correctly', () => {
    renderPinnedNote({ reason: 'Some reason' });
    expect(screen.getByText('Pinned note')).toBeInTheDocument();
    expect(screen.getByText('Some reason')).toBeInTheDocument();
  });

  it('renders reason correctly', () => {
    renderPinnedNote({ reason: 'Some reason' });
    expect(screen.getByText('Some reason')).toBeInTheDocument();
  });

  it('renders note correctly', () => {
    renderPinnedNote({ reason: 'Some reason', note: 'Some note' });
    const reasonWithNote = screen.getByText('Some reason', { exact: false });
    expect(reasonWithNote).toBeInTheDocument();

    const note = screen.getByText('Some note');
    expect(note).toHaveTextContent('Some note');
  });

  it('renders author correctly', () => {
    renderPinnedNote({
      reason: 'Some reason',
      author: 'belce@onefootprint.com',
    });
    expect(
      screen.getByText('Pinned note from belce@onefootprint.com'),
    ).toBeInTheDocument();
    expect(screen.getByText('Some reason')).toBeInTheDocument();
  });
});
