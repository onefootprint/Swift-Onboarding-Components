import { customRender, mockRouter, screen } from '@onefootprint/test-utils';

import type { PinnedNoteProps } from './pinned-note';
import PinnedNote from './pinned-note';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<PinnedNote />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/entities/1');
    mockRouter.query = {
      id: '1',
    };
  });

  const renderPinnedNote = ({ author, note, timestamp, noteId }: PinnedNoteProps) =>
    customRender(<PinnedNote author={author} note={note} timestamp={timestamp} noteId={noteId} />);

  it('should render the note correctly', () => {
    renderPinnedNote({
      note: 'Lorem ipsum dolor simet at magna',
      timestamp: '4/27/23, 3:24 PM',
      noteId: '1',
    });
    const note = screen.getByText('Lorem ipsum dolor simet at magna');
    expect(note).toBeInTheDocument();
  });

  it('should render the author correctly', () => {
    renderPinnedNote({
      note: 'Lorem ipsum dolor simet at magna',
      author: 'jane.doe@acme.com',
      timestamp: '4/27/23, 3:24 PM',
      noteId: '1',
    });
    const author = screen.getByText('From jane.doe@acme.com');
    expect(author).toBeInTheDocument();
  });

  it('should render the timestamp correctly', () => {
    renderPinnedNote({
      note: 'Lorem ipsum dolor simet at magna',
      author: 'jane.doe@acme.com',
      timestamp: '4/27/23, 3:24 PM',
      noteId: '1',
    });
    const timestamp = screen.getByText('4/27/23, 3:24 PM');
    expect(timestamp).toBeInTheDocument();
  });
});
