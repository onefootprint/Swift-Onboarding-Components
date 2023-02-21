import { useIdentifyMachine } from 'src/components/identify-machine-provider';

const appendSuffix = (value: string, suffix: string) => `${value}${suffix}`;

const useIdentifierSuffix = () => {
  const [state] = useIdentifyMachine();
  const { identifierSuffix } = state.context.identify;

  const append = (value: string = '') => {
    if (identifierSuffix) {
      return appendSuffix(value, identifierSuffix);
    }
    return value;
  };

  const remove = (value: string = '') => {
    if (identifierSuffix) {
      return value.replace(identifierSuffix, '');
    }
    return value;
  };

  return { append, remove };
};

export default useIdentifierSuffix;
