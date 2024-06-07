import type { Document } from '@onefootprint/types';
import { useRouter } from 'next/router';

const useCurrentSession = (documents: Document[]) => {
  const { query, push } = useRouter();
  const { session } = query;

  const sessionIsValid = (sessionKey: string): boolean => documents.some(doc => doc.startedAt === sessionKey);

  const getSessionValue = (): string => {
    const decodedSession = session ? decodeURIComponent(session as string) : '';
    return sessionIsValid(decodedSession) ? decodedSession : documents[0]?.startedAt ?? '';
  };

  const getCurrentDocument = () => documents.find(doc => doc.startedAt === getSessionValue());

  const updateSession = (newSession: string) => {
    if (sessionIsValid(newSession)) {
      push({ query: { ...query, session: newSession } });
    }
  };

  return [getCurrentDocument(), updateSession] as const;
};

export default useCurrentSession;
