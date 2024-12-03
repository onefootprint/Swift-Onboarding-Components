import { renderHook } from '@onefootprint/test-utils';
import useRequestParams from './use-request-params';

describe('useRequestParams', () => {
  const defaultValues = {
    dateRange: [],
    dataAttributesBusiness: [],
    dataAttributesPersonal: [],
    search: '',
    names: [],
  };

  it('should return empty params when no filters are set', () => {
    const { result } = renderHook(() => useRequestParams(defaultValues));
    expect(result.current).toEqual({});
  });

  it('should include names in params when event names are selected', () => {
    const { result } = renderHook(() =>
      useRequestParams({
        ...defaultValues,
        names: ['update_user_data', 'delete_user_data'],
      }),
    );
    expect(result.current).toEqual({
      names: 'update_user_data,delete_user_data',
    });
  });

  it('should not include names in params when names array is empty', () => {
    const { result } = renderHook(() =>
      useRequestParams({
        ...defaultValues,
        names: [],
      }),
    );
    expect(result.current).toEqual({});
  });

  it('should combine names with other filter params', () => {
    const { result } = renderHook(() =>
      useRequestParams({
        ...defaultValues,
        names: ['update_user_data'],
        search: 'test search',
        dataAttributesBusiness: ['business.dba'],
      }),
    );
    expect(result.current).toEqual({
      names: 'update_user_data',
      search: 'test search',
      targets: 'business.dba',
    });
  });

  it('should handle single name in array', () => {
    const { result } = renderHook(() =>
      useRequestParams({
        ...defaultValues,
        names: ['update_user_data'],
      }),
    );
    expect(result.current).toEqual({
      names: 'update_user_data',
    });
  });

  it('should handle multiple names in array', () => {
    const { result } = renderHook(() =>
      useRequestParams({
        ...defaultValues,
        names: ['update_user_data', 'delete_user_data', 'create_org_role'],
      }),
    );
    expect(result.current).toEqual({
      names: 'update_user_data,delete_user_data,create_org_role',
    });
  });

  it('should combine names with date range params', () => {
    const { result } = renderHook(() =>
      useRequestParams({
        ...defaultValues,
        names: ['update_user_data'],
        dateRange: ['2023-01-01', '2023-12-31'],
      }),
    );
    expect(result.current).toMatchObject({
      names: 'update_user_data',
      timestamp_gte: expect.any(String),
      timestamp_lte: expect.any(String),
    });
  });

  it('should handle all filter types together', () => {
    const { result } = renderHook(() =>
      useRequestParams({
        dateRange: ['2023-01-01', '2023-12-31'],
        dataAttributesBusiness: ['business.dba'],
        dataAttributesPersonal: ['id.first_name'],
        search: 'test search',
        names: ['update_user_data', 'delete_user_data'],
      }),
    );
    expect(result.current).toMatchObject({
      timestamp_gte: expect.any(String),
      timestamp_lte: expect.any(String),
      targets: 'business.dba,id.first_name',
      search: 'test search',
      names: 'update_user_data,delete_user_data',
    });
  });

  it('should maintain order of names in params', () => {
    const names = ['update_user_data', 'delete_user_data', 'create_org_role'];
    const { result } = renderHook(() =>
      useRequestParams({
        ...defaultValues,
        names,
      }),
    );
    expect(result.current.names).toBe(names.join(','));
  });

  it('should handle rerendering with same values', () => {
    const names = ['update_user_data', 'delete_user_data'];
    const { result, rerender } = renderHook(props => useRequestParams({ ...defaultValues, ...props }), {
      initialProps: { names },
    });

    const firstResult = result.current;
    rerender({ names });

    expect(result.current).toBe(firstResult); // Should return same object reference
  });
});
