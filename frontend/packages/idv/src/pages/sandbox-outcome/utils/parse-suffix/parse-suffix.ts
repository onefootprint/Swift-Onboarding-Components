const parseSuffix = (value?: string) => {
  if (!value) return '';
  const [, suffix] = value.split('#');
  return suffix;
};

export default parseSuffix;
