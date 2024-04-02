import constate from 'constate';

type UsePlaybookContext = {
  listPath: string;
};

const usePlaybook = (options: UsePlaybookContext) => options;

const [Provider, usePlaybookContext] = constate(usePlaybook);

export default Provider;
export { usePlaybookContext };
