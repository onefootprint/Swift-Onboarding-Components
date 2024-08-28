const formatDisplayDate = (value: string) => {
  const dateParts = value.split(/[-/]/);
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];
  return `${year}-${month}-${day}`;
};

export default formatDisplayDate;
