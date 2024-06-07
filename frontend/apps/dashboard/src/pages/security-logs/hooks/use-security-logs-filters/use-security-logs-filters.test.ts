import { createUseRouterSpy, customRenderHook } from '@onefootprint/test-utils';

import useSecurityLogsFilters from './use-security-logs-filters';

describe('useSecurityLogsFilters', () => {
  const useRouterSpy = createUseRouterSpy();

  describe('should add attributes to empty query as expected', () => {
    it('should correctly push personal attributes to query', () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/security-logs',
        query: {},
        push: pushMockFn,
      });

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        data_attributes_personal: ['id.email', 'id.phone_number'],
      });
      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            data_attributes_personal: ['id.email', 'id.phone_number'],
          },
        },
        undefined,
        { shallow: true },
      );
    });

    it('should correctly push business attributes to query', () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/security-logs',
        query: {},
        push: pushMockFn,
      });

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        data_attributes_business: ['business.name', 'business.dba'],
      });
      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            data_attributes_business: ['business.name', 'business.dba'],
          },
        },
        undefined,
        { shallow: true },
      );
    });
  });

  describe('should add attributes to query with un-like attributes as expected', () => {
    it('should add business attributes correctly to already added personal attributes', () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/security-logs',
        query: {
          data_attributes_personal: ['id.first_name', 'id.phone_number'],
        },
        push: pushMockFn,
      });

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        data_attributes_business: ['business.name', 'business.dba'],
      });

      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            data_attributes_personal: ['id.first_name', 'id.phone_number'],
            data_attributes_business: ['business.name', 'business.dba'],
          },
        },
        undefined,
        { shallow: true },
      );
    });

    it('should add personal attributes correctly to already added business attributes', () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/security-logs',
        query: { data_attributes_business: ['business.dba', 'business.name'] },
        push: pushMockFn,
      });

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        data_attributes_personal: ['id.first_name', 'id.phone_number'],
      });

      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            data_attributes_business: ['business.dba', 'business.name'],
            data_attributes_personal: ['id.first_name', 'id.phone_number'],
          },
        },
        undefined,
        { shallow: true },
      );
    });
  });

  describe('should be able to remove attributes', () => {
    it('should be able to remove several personal attributes from selected group of personal attributes', () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/security-logs',
        query: {
          data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
        },
        push: pushMockFn,
      });

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        // removing id.first_name and id.last_name
        data_attributes_personal: ['id.phone_number'],
      });

      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            data_attributes_personal: ['id.phone_number'],
          },
        },
        undefined,
        { shallow: true },
      );
    });

    it('should be able to remove business attributes from selected group of business attributes', () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/security-logs',
        query: {
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
        },
        push: pushMockFn,
      });

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        // removing business.website and business.name
        data_attributes_business: ['business.dba'],
      });

      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            data_attributes_business: ['business.dba'],
          },
        },
        undefined,
        { shallow: true },
      );
    });
  });

  describe('should be able to remove attributes from mixed query', () => {
    it('should be able to remove business attributes from a mix of selected business and personal attributes', () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/security-logs',
        query: {
          data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
        },
        push: pushMockFn,
      });

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        // removing business.website and business.name
        data_attributes_business: ['business.dba'],
      });

      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            // all personal attributes should remain unchanged — only business data should change
            data_attributes_business: ['business.dba'],
            data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
          },
        },
        undefined,
        { shallow: true },
      );
    });

    it('should be able to remove personal attributes from a mix of selected personal and business attributes', () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/security-logs',
        query: {
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
          data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
        },
        push: pushMockFn,
      });

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        // removing id.first_name and id.last_name
        data_attributes_personal: ['id.phone_number'],
      });

      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            // all personal attributes should remain unchanged — only business data should change
            data_attributes_personal: ['id.phone_number'],
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
          },
        },
        undefined,
        { shallow: true },
      );
    });
  });

  describe('should be able to fully clear attributes of one type', () => {
    it('should be able to remove all personal attributes', () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/security-logs',
        query: {
          data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
        },
        push: pushMockFn,
      });

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        // removing everything!
        data_attributes_personal: [],
      });

      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            data_attributes_personal: [],
          },
        },
        undefined,
        { shallow: true },
      );
    });

    it('should be able to remove all business attributes', () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/security-logs',
        query: {
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
        },
        push: pushMockFn,
      });

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        // removing everything!
        data_attributes_business: [],
      });

      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            data_attributes_business: [],
          },
        },
        undefined,
        { shallow: true },
      );
    });
  });

  describe('should be able to fully clear attributes from a mixed set of them', () => {
    it('should to clear personal attributes and leave business attrs unchanged', () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/security-logs',
        query: {
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
          data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
        },
        push: pushMockFn,
      });

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        data_attributes_personal: [],
      });

      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
            data_attributes_personal: [],
          },
        },
        undefined,
        { shallow: true },
      );
    });

    it('should be able to fully clear personal attrs and leave business attrs unchanged', () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: '/security-logs',
        query: {
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
          data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
        },
        push: pushMockFn,
      });

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        data_attributes_business: [],
      });

      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
            data_attributes_business: [],
          },
        },
        undefined,
        { shallow: true },
      );
    });
  });

  describe('date_range and search', () => {
    describe('should persist date range', () => {
      it('when adding attributes, should persist date range', () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/security-logs',
          query: {
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
            data_attributes_personal: ['id.phone_number'],
            date_range: ['last-7-days'],
          },
          push: pushMockFn,
        });

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
        });

        expect(pushMockFn).toHaveBeenCalledWith(
          {
            query: {
              data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
              data_attributes_business: ['business.website', 'business.name', 'business.dba'],
              date_range: ['last-7-days'],
            },
          },
          undefined,
          { shallow: true },
        );
      });

      it('when removing attributes, should persist date range', () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/security-logs',
          query: {
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
            data_attributes_personal: ['id.phone_number'],
            date_range: ['last-7-days'],
          },
          push: pushMockFn,
        });

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          data_attributes_business: ['business.website'],
        });

        expect(pushMockFn).toHaveBeenCalledWith(
          {
            query: {
              data_attributes_business: ['business.website'],
              data_attributes_personal: ['id.phone_number'],
              date_range: ['last-7-days'],
            },
          },
          undefined,
          { shallow: true },
        );
      });

      it('when clearing attributes, should persist date range', () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/security-logs',
          query: {
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
            data_attributes_personal: ['id.phone_number'],
            date_range: ['last-7-days'],
          },
          push: pushMockFn,
        });

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          data_attributes_business: [],
        });

        expect(pushMockFn).toHaveBeenCalledWith(
          {
            query: {
              data_attributes_personal: ['id.phone_number'],
              data_attributes_business: [],
              date_range: ['last-7-days'],
            },
          },
          undefined,
          { shallow: true },
        );
      });
    });

    describe('should persist search', () => {
      it('when adding attributes, should persist search', () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/security-logs',
          query: {
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
            data_attributes_personal: ['id.phone_number'],
            search: ['Test search'],
          },
          push: pushMockFn,
        });

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
        });

        expect(pushMockFn).toHaveBeenCalledWith(
          {
            query: {
              data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
              data_attributes_business: ['business.website', 'business.name', 'business.dba'],
              search: ['Test search'],
            },
          },
          undefined,
          { shallow: true },
        );
      });

      it('when removing attributes, should persist search', () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/security-logs',
          query: {
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
            data_attributes_personal: ['id.phone_number'],
            search: ['Test search'],
          },
          push: pushMockFn,
        });

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          data_attributes_business: ['business.website'],
        });

        expect(pushMockFn).toHaveBeenCalledWith(
          {
            query: {
              data_attributes_business: ['business.website'],
              data_attributes_personal: ['id.phone_number'],
              search: ['Test search'],
            },
          },
          undefined,
          { shallow: true },
        );
      });

      it('when clearing attributes, should persist search', () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/security-logs',
          query: {
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
            data_attributes_personal: ['id.phone_number'],
            search: ['Test search'],
          },
          push: pushMockFn,
        });

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          data_attributes_business: [],
        });

        expect(pushMockFn).toHaveBeenCalledWith(
          {
            query: {
              data_attributes_personal: ['id.phone_number'],
              data_attributes_business: [],
              search: ['Test search'],
            },
          },
          undefined,
          { shallow: true },
        );
      });
    });

    describe('should persist other attributes when updating date_range or search', () => {
      it('should persist attributes while updating date_range', () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/security-logs',
          query: {
            data_attributes_personal: ['id.phone_number'],
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
            date_range: ['last-7-days'],
            search: ['Test search'],
          },
          push: pushMockFn,
        });

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          date_range: ['last-30-days'],
        });

        expect(pushMockFn).toHaveBeenCalledWith(
          {
            query: {
              data_attributes_business: ['business.website', 'business.name', 'business.dba'],
              data_attributes_personal: ['id.phone_number'],
              date_range: ['last-30-days'],
              search: ['Test search'],
            },
          },
          undefined,
          { shallow: true },
        );
      });

      it('should persist attributes while updating search', () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/security-logs',
          query: {
            data_attributes_personal: ['id.phone_number'],
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
            date_range: ['last-30-days'],
          },
          push: pushMockFn,
        });

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          search: ['Test search'],
        });

        expect(pushMockFn).toHaveBeenCalledWith(
          {
            query: {
              data_attributes_personal: ['id.phone_number'],
              data_attributes_business: ['business.website', 'business.name', 'business.dba'],
              date_range: ['last-30-days'],
              search: ['Test search'],
            },
          },
          undefined,
          { shallow: true },
        );
      });
    });
  });
});
