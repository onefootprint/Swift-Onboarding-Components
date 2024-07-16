const hasUserCancelledPasskey = (error: unknown) => {
  return error?.error === 'UserCancelled';
};

export default hasUserCancelledPasskey;
