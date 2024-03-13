import type { NextRequest } from 'next/server';
import { i18nRouter } from 'next-i18n-router';

import { i18nConfig } from '@/i18n/config';

export function middleware(request: NextRequest) {
  return i18nRouter(request, i18nConfig);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
}; // applies this middleware only to files in the app directory
