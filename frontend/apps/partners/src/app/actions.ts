'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const createAuthCookie = async (token: string): Promise<void> => {
  cookies().set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
  });
};

export const getAuthCookie = async (): Promise<string | undefined> => cookies().get('token')?.value;

export const deleteAuthCookie = async (): Promise<void> => {
  const oneDay = 24 * 60 * 60 * 1000;
  cookies().set('token', '', { expires: Date.now() - oneDay });
};

export const revalidatePathAction = async (path: string): Promise<void> => {
  revalidatePath(path);
};
