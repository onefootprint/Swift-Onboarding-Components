import type { GroupBase, OptionsOrGroups } from 'react-select';

type OptionType = { value: string; label: string };

const prependAllOption = (
  initialOptions: OptionsOrGroups<OptionType, GroupBase<OptionType>> | undefined,
  selectAllOption?: OptionType,
): OptionsOrGroups<OptionType, GroupBase<OptionType>> | undefined => {
  if (!selectAllOption) {
    return initialOptions;
  }

  if (!initialOptions) {
    return [selectAllOption];
  }

  if ('options' in initialOptions[0] && !Array.isArray(initialOptions[0].options)) {
    return [selectAllOption, ...(initialOptions as OptionType[])];
  }

  const result = initialOptions as GroupBase<OptionType>[];
  return [{ options: [selectAllOption] }, ...result];
};

export default prependAllOption;
