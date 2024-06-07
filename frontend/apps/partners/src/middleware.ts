import { i18nRouter } from 'next-i18n-router';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { i18nConfig } from '@/i18n/config';

import { DEFAULT_PUBLIC_ROUTE } from './config/constants';

export function middleware(request: NextRequest) {
  const authToken = cookies().get('token')?.value;

  if (!authToken && !/^(\/(en|es))?\/auth/.test(request.nextUrl.pathname)) {
    return Response.redirect(new URL(DEFAULT_PUBLIC_ROUTE, request.url));
  }

  return i18nRouter(request, i18nConfig);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
}; // applies this middleware only to files in the app directory
