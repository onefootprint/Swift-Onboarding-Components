import { CommonPropsAndClassName, GroupBase } from 'react-select';

const cleanCommonProps = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
  AdditionalProps,
>(
  props: Partial<CommonPropsAndClassName<Option, IsMulti, Group>> &
    AdditionalProps,
): Omit<
  AdditionalProps,
  keyof CommonPropsAndClassName<Option, IsMulti, Group>
> => {
  const {
    className,
    clearValue,
    cx,
    getStyles,
    getValue,
    hasValue,
    isMulti,
    isRtl,
    options,
    selectOption,
    selectProps,
    setValue,
    theme,
    ...innerProps
  } = props;
  return { ...innerProps };
};

export default cleanCommonProps;
