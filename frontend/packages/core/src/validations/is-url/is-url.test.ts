import isURL, { isURLWithProtocol } from './is-url';

describe('isURL', () => {
  describe('is URL with protocol', () => {
    it('should return true for valid URLs', () => {
      const validURLs = [
        'http://www.example.com',
        'https://www.example.com',
        'http://example.com',
        'https://example.com',
        'http://example.com/',
        'https://example.com/',
        'http://example.com/path',
        'https://example.com/path',
        'http://example.com/path/',
        'https://example.com/path/',
        'http://example.com/path?query',
        'https://example.com/path?query',
        'http://example.com/path/?query',
        'https://example.com/path/?query',
        'http://example.com/path?query#fragment',
        'https://example.com/path?query#fragment',
        'http://example.com/path/?query#fragment',
        'https://example.com/path/?query#fragment',
        'https://example.com/path/?query=7#fragment',
      ];
      validURLs.forEach(url => {
        expect(isURL(url)).toBe(true);
        expect(isURLWithProtocol(url)).toBe(true);
      });
    });
    it('should return false for invalid URLs', () => {
      const invalidURLs = [
        'http://',
        'https://',
        'http://.',
        'https://.',
        'http://..',
        'https://..',
        'http://../',
        'https://../',
        'http://?',
        'https://?',
        'http://??',
        'https://??',
        'http://??/',
        'https://??/',
        'http://#',
        'https://#',
        'http://##',
        'https://##',
        'http://##/',
        'https://##/',
        'http://foo.bar?q=Spaces should be encoded',
        'http:// shouldfail.com',
        ':// should fail',
        'http://foo.bar/foo(bar)baz quux',
        'ftps://foo.bar/',
      ];
      invalidURLs.forEach(url => {
        expect(isURL(url)).toBe(false);
        expect(isURLWithProtocol(url)).toBe(false);
      });
    });
  });
  describe('is URL without protocol', () => {
    it('should return true for valid URLs', () => {
      const validURLs = [
        'www.example.com',
        'example.com',
        'example.com/',
        'example.com/path',
        'example.com/path/',
        'example.com/path?query',
        'example.com/path/?query',
        'example.com/path?query#fragment',
        'example.com/path/?query#fragment',
        'example.com/path/?query=9#fragment',
      ];
      validURLs.forEach(url => {
        expect(isURL(url)).toBe(true);
        expect(isURLWithProtocol(url)).toBe(false);
      });
    });
    it('should return false for invalid URLs', () => {
      const invalidURLs = [
        'http://',
        'https://',
        'http://.',
        'https://.',
        'http://..',
        'https://..',
        'http://../',
        'https://../',
        'http://?',
        'https://?',
        'http://??',
        'https://??',
        'http://??/',
        'https://??/',
        'http://#',
        'https://#',
        'http://##',
        'https://##',
        'http://##/',
        'https://##/',
        'http://foo.bar?q=Spaces should be encoded',
        'http:// shouldfail.com',
        ':// should fail',
        'http://foo.bar/foo(bar)baz quux',
        'ftps://foo.bar/',
      ];
      invalidURLs.forEach(url => {
        expect(isURL(url)).toBe(false);
        expect(isURLWithProtocol(url)).toBe(false);
      });
    });
  });
});
