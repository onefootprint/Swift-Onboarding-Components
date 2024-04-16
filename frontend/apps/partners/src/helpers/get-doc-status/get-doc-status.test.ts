import { describe, expect, it } from 'bun:test';

import getDocStatus from './get-doc-status';

// @ts-ignore: dump translation function
const t: TFunction<'common'> = x => x;

describe('getDocStatus', () => {
  it.each([
    { s: 'accepted', out: { color: 'success', text: 'accepted' } },
    { s: 'rejected', out: { color: 'error', text: 'rejected' } },
    { s: 'not_requested', out: { color: 'error', text: 'not-requested' } },
    {
      s: 'waiting_for_review',
      out: { color: 'info', text: 'waiting-for-review' },
    },
    {
      s: 'waiting_for_upload',
      out: { color: 'primary', text: 'waiting-for-upload' },
    },
  ])('case %#', ({ s, out }) => {
    // @ts-ignore: color is a string
    expect(getDocStatus(t, s)).toEqual(out);
  });
});
