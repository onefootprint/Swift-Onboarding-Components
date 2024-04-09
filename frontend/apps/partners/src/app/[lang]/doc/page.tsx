'use server';

import { redirect } from 'next/navigation';

import { DEFAULT_PRIVATE_ROUTE } from '@/config/constants';

export default async function DocRootPage() {
  return redirect(DEFAULT_PRIVATE_ROUTE);
}
