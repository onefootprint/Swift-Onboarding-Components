const checkIsExpired = (expiresAt?: Date) => {
  if (!expiresAt) {
    return false;
  }

  const now = new Date();
  const isExpired = now > expiresAt;
  if (isExpired) {
    console.error('Client token has expired. Please generate a new one');
  }
  return isExpired;
};

export default checkIsExpired;
