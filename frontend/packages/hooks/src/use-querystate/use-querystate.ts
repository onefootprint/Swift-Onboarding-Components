import { useQueryState as useNextQueryState } from 'next-usequerystate';

type UseQueryStateParams<T> = {
  query: string;
  defaultValue: T;
};

const useQueryState = <T extends string>({ query, defaultValue }: UseQueryStateParams<T>) => {
  const [value, setTab] = useNextQueryState(query, {
    defaultValue,
    history: 'push',
  });

  const setValue = (newValue: T) => {
    setTab(newValue, { scroll: false, shallow: true });
  };

  return [value, setValue] as const;
};

export default useQueryState;
