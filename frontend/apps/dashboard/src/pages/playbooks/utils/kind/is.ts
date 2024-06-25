import { PlaybookKind } from '@/playbooks/utils/machine/types';

export const isAuth = (x: unknown): x is PlaybookKind.Auth => x === PlaybookKind.Auth;

export const isIdDoc = (x: unknown): x is PlaybookKind.IdDoc => x === PlaybookKind.IdDoc;

export const isKyb = (x: unknown): x is PlaybookKind.Kyb => x === PlaybookKind.Kyb;

export const isKyc = (x: unknown): x is PlaybookKind.Kyc => x === PlaybookKind.Kyc;
