import { customRenderHook } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';

import useSecurityLogsFilters from './use-security-logs-filters';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('useSecurityLogsFilters', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/security-logs');
  });

  describe('should add attributes to empty query as expected', () => {
    it('should correctly push personal attributes to query', () => {
      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        data_attributes_personal: ['id.email', 'id.phone_number'],
      });
      expect(mockRouter).toMatchObject({
        query: {
          data_attributes_personal: ['id.email', 'id.phone_number'],
        },
      });
    });

    it('should correctly push business attributes to query', () => {
      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        data_attributes_business: ['business.name', 'business.dba'],
      });
      expect(mockRouter).toMatchObject({
        query: {
          data_attributes_business: ['business.name', 'business.dba'],
        },
      });
    });
  });

  describe('should add attributes to query with un-like attributes as expected', () => {
    it('should add business attributes correctly to already added personal attributes', () => {
      mockRouter.query = {
        data_attributes_personal: ['id.first_name', 'id.phone_number'],
      };

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        data_attributes_business: ['business.name', 'business.dba'],
      });

      expect(mockRouter).toMatchObject({
        query: {
          data_attributes_personal: ['id.first_name', 'id.phone_number'],
          data_attributes_business: ['business.name', 'business.dba'],
        },
      });
    });

    it('should add personal attributes correctly to already added business attributes', () => {
      mockRouter.query = {
        data_attributes_business: ['business.dba', 'business.name'],
      };
      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        data_attributes_personal: ['id.first_name', 'id.phone_number'],
      });

      expect(mockRouter).toMatchObject({
        query: {
          data_attributes_business: ['business.dba', 'business.name'],
          data_attributes_personal: ['id.first_name', 'id.phone_number'],
        },
      });
    });
  });

  describe('should be able to remove attributes', () => {
    it('should be able to remove several personal attributes from selected group of personal attributes', () => {
      mockRouter.query = {
        data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
      };

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        // removing id.first_name and id.last_name
        data_attributes_personal: ['id.phone_number'],
      });

      expect(mockRouter).toMatchObject({
        query: {
          data_attributes_personal: ['id.phone_number'],
        },
      });
    });

    it('should be able to remove business attributes from selected group of business attributes', () => {
      mockRouter.query = {
        data_attributes_business: ['business.website', 'business.name', 'business.dba'],
      };

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        // removing business.website and business.name
        data_attributes_business: ['business.dba'],
      });

      expect(mockRouter).toMatchObject({
        query: {
          data_attributes_business: ['business.dba'],
        },
      });
    });
  });

  describe('should be able to remove attributes from mixed query', () => {
    it('should be able to remove business attributes from a mix of selected business and personal attributes', () => {
      mockRouter.query = {
        data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
        data_attributes_business: ['business.website', 'business.name', 'business.dba'],
      };

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        // removing business.website and business.name
        data_attributes_business: ['business.dba'],
      });

      expect(mockRouter).toMatchObject({
        query: {
          // all personal attributes should remain unchanged — only business data should change
          data_attributes_business: ['business.dba'],
          data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
        },
      });
    });

    it('should be able to remove personal attributes from a mix of selected personal and business attributes', () => {
      mockRouter.query = {
        data_attributes_business: ['business.website', 'business.name', 'business.dba'],
        data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
      };
      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        // removing id.first_name and id.last_name
        data_attributes_personal: ['id.phone_number'],
      });

      expect(mockRouter).toMatchObject({
        query: {
          // all personal attributes should remain unchanged — only business data should change
          data_attributes_personal: ['id.phone_number'],
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
        },
      });
    });
  });

  describe('should be able to fully clear attributes of one type', () => {
    it('should be able to remove all personal attributes', () => {
      mockRouter.query = {
        data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
      };

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        // removing everything!
        data_attributes_personal: [],
      });

      expect(mockRouter).toMatchObject({
        query: {
          data_attributes_personal: [],
        },
      });
    });

    it('should be able to remove all business attributes', () => {
      mockRouter.query = {
        data_attributes_business: ['business.website', 'business.name', 'business.dba'],
      };

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        // removing everything!
        data_attributes_business: [],
      });

      expect(mockRouter).toMatchObject({
        query: {
          data_attributes_business: [],
        },
      });
    });
  });

  describe('should be able to fully clear attributes from a mixed set of them', () => {
    it('should to clear personal attributes and leave business attrs unchanged', () => {
      mockRouter.query = {
        data_attributes_business: ['business.website', 'business.name', 'business.dba'],
        data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
      };

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        data_attributes_personal: [],
      });

      expect(mockRouter).toMatchObject({
        query: {
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
          data_attributes_personal: [],
        },
      });
    });

    it('should be able to fully clear personal attrs and leave business attrs unchanged', () => {
      mockRouter.query = {
        data_attributes_business: ['business.website', 'business.name', 'business.dba'],
        data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
      };

      const { result } = customRenderHook(() => useSecurityLogsFilters());
      result.current.push({
        data_attributes_business: [],
      });

      expect(mockRouter).toMatchObject({
        query: {
          data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
          data_attributes_business: [],
        },
      });
    });
  });

  describe('date_range and search', () => {
    describe('should persist date range', () => {
      it('when adding attributes, should persist date range', () => {
        mockRouter.query = {
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
          data_attributes_personal: ['id.phone_number'],
          date_range: ['last-7-days'],
        };

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
        });

        expect(mockRouter).toMatchObject({
          query: {
            data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
            date_range: ['last-7-days'],
          },
        });
      });

      it('when removing attributes, should persist date range', () => {
        mockRouter.query = {
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
          data_attributes_personal: ['id.phone_number'],
          date_range: ['last-7-days'],
        };

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          data_attributes_business: ['business.website'],
        });

        expect(mockRouter).toMatchObject({
          query: {
            data_attributes_business: ['business.website'],
            data_attributes_personal: ['id.phone_number'],
            date_range: ['last-7-days'],
          },
        });
      });

      it('when clearing attributes, should persist date range', () => {
        mockRouter.query = {
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
          data_attributes_personal: ['id.phone_number'],
          date_range: ['last-7-days'],
        };

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          data_attributes_business: [],
        });

        expect(mockRouter).toMatchObject({
          query: {
            data_attributes_personal: ['id.phone_number'],
            data_attributes_business: [],
            date_range: ['last-7-days'],
          },
        });
      });
    });

    describe('should persist search', () => {
      it('when adding attributes, should persist search', () => {
        mockRouter.query = {
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
          data_attributes_personal: ['id.phone_number'],
          search: ['Test search'],
        };

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
        });

        expect(mockRouter).toMatchObject({
          query: {
            data_attributes_personal: ['id.first_name', 'id.last_name', 'id.phone_number'],
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
            search: ['Test search'],
          },
        });
      });

      it('when removing attributes, should persist search', () => {
        mockRouter.query = {
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
          data_attributes_personal: ['id.phone_number'],
          search: ['Test search'],
        };

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          data_attributes_business: ['business.website'],
        });

        expect(mockRouter).toMatchObject({
          query: {
            data_attributes_business: ['business.website'],
            data_attributes_personal: ['id.phone_number'],
            search: ['Test search'],
          },
        });
      });

      it('when clearing attributes, should persist search', () => {
        mockRouter.query = {
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
          data_attributes_personal: ['id.phone_number'],
          search: ['Test search'],
        };

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          data_attributes_business: [],
        });

        expect(mockRouter).toMatchObject({
          query: {
            data_attributes_personal: ['id.phone_number'],
            data_attributes_business: [],
            search: ['Test search'],
          },
        });
      });
    });

    describe('should persist other attributes when updating date_range or search', () => {
      it('should persist attributes while updating date_range', () => {
        mockRouter.query = {
          data_attributes_personal: ['id.phone_number'],
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
          date_range: ['last-7-days'],
          search: ['Test search'],
        };

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          date_range: ['last-30-days'],
        });

        expect(mockRouter).toMatchObject({
          query: {
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
            data_attributes_personal: ['id.phone_number'],
            date_range: ['last-30-days'],
            search: ['Test search'],
          },
        });
      });

      it('should persist attributes while updating search', () => {
        mockRouter.query = {
          data_attributes_personal: ['id.phone_number'],
          data_attributes_business: ['business.website', 'business.name', 'business.dba'],
          date_range: ['last-30-days'],
        };

        const { result } = customRenderHook(() => useSecurityLogsFilters());
        result.current.push({
          search: ['Test search'],
        });

        expect(mockRouter).toMatchObject({
          query: {
            data_attributes_personal: ['id.phone_number'],
            data_attributes_business: ['business.website', 'business.name', 'business.dba'],
            date_range: ['last-30-days'],
            search: ['Test search'],
          },
        });
      });
    });
  });
});
