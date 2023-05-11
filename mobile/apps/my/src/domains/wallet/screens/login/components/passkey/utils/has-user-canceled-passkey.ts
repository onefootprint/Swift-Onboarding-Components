const hasUserCancelledPasskey = (error: any) => {
  return error?.error === 'UserCancelled';
};

export default hasUserCancelledPasskey;
