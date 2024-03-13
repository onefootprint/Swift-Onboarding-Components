'use server';

import { redirect } from 'next/navigation';

export default async function AppPage() {
  return redirect('/app/companies');
}
