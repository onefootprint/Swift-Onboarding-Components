import {
  parseAnnotationNote,
  stringifyAnnotationNote,
} from './annotation-note-utils';

describe('annotation note utils', () => {
  describe('stringifyAnnotationNote', () => {
    it('stringifies correctly', () => {
      expect(
        stringifyAnnotationNote({
          reason: '',
        }),
      ).toEqual('{"reason":""}');

      expect(
        stringifyAnnotationNote({
          reason: 'Some Reason',
        }),
      ).toEqual('{"reason":"Some Reason"}');

      expect(
        stringifyAnnotationNote({
          reason: 'Some Reason',
          note: 'Some note',
        }),
      ).toEqual('{"reason":"Some Reason","note":"Some note"}');
    });
  });

  describe('parseAnnotationNote', () => {
    it('parses correctly', () => {
      expect(parseAnnotationNote('')).toEqual({
        reason: '',
      });

      expect(parseAnnotationNote('{"reason":"Some Reason"}')).toEqual({
        reason: 'Some Reason',
      });

      expect(
        parseAnnotationNote('{"reason":"Some Reason","note":"Some note"}'),
      ).toEqual({
        reason: 'Some Reason',
        note: 'Some note',
      });
    });
  });
});
