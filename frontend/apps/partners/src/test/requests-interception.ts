// @ts-ignore: Module '"msw"' has no exported member 'http'.
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { docEventAssigned, docEventRequested, docEventReviewedAccepted, docEventSubmitted } from '@/test/responses';

const testBaseUrl = 'http://test';
process.env.NEXT_PUBLIC_API_BASE_URL = testBaseUrl;

const server = setupServer(
  http.get(`${testBaseUrl}/partner/partnerships/:id/documents/:docId/events`, (req: { params: { docId: string } }) =>
    req.params.docId === 'submitted_3'
      ? HttpResponse.json([docEventSubmitted])
      : HttpResponse.json([docEventRequested, docEventReviewedAccepted, docEventSubmitted, docEventAssigned]),
  ),
);

export default server;

/** Uncomment to debug requests */
// server.events.on('request:start', ({ request }) => {
//   console.log('----------- MSW intercepted:', request.method, request.url); // eslint-disable-line no-console
// });
