export const createColumns = (columns?: string | string[]) => {
  if (typeof columns === 'string') {
    return columns;
  }

  if (Array.isArray(columns)) {
    return columns.join(' ');
  }

  return undefined;
};

export const createRows = (rows?: string | string[]) => {
  if (typeof rows === 'string') {
    return rows;
  }

  if (Array.isArray(rows)) {
    return rows.join(' ');
  }

  return undefined;
};
