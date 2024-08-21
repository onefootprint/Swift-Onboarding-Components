import { useRouter } from 'next/router';
import type { z } from 'zod';

const useGetQueryParam = <T extends z.Schema>(querySchema: T) => {
  const { query } = useRouter();

  return querySchema.parse(query) as z.infer<typeof querySchema>;
};

export default useGetQueryParam;
