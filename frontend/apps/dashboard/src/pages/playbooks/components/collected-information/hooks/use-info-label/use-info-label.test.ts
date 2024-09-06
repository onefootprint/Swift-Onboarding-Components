import { renderHook } from '@onefootprint/test-utils';
import useInfoLabel from './use-info-label';

describe('useInfoLabel', () => {
  it('returns the correct label for a non-SSN field', () => {
    const { result } = renderHook(() => useInfoLabel());
    const label = result.current('name');
    expect(label).toBe('Full name');
  });

  it('returns the correct label for SSN-9', () => {
    const { result } = renderHook(() => useInfoLabel());
    const label = result.current('ssn', { kind: 'ssn9', active: true });
    expect(label).toBe('SSN (Full)');
  });

  it('returns the correct label for SSN-4', () => {
    const { result } = renderHook(() => useInfoLabel());
    const label = result.current('ssn', { kind: 'ssn4', active: true });
    expect(label).toBe('SSN (Last 4)');
  });
});
