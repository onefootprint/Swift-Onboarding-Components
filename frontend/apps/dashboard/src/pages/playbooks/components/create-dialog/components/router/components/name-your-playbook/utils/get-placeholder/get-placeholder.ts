type GetPlaceholderProps = {
  kindString: string;
  tenantName: string;
};

const getPlaceholder = ({ kindString, tenantName }: GetPlaceholderProps) => {
  const dateString = new Date().toLocaleString('en-us', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
  return `${tenantName} ${kindString} (${dateString})`;
};

export default getPlaceholder;
