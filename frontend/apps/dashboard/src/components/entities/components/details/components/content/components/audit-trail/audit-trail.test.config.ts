import { mockRequest } from '@onefootprint/test-utils';

const mockFrequentNotes = () => {
  mockRequest({
    method: 'get',
    path: '/org/frequent_notes',
    response: {},
  });
};

export default mockFrequentNotes;
