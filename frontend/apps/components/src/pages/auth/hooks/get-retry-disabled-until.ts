const getRetryDisabledUntil = (timeBeforeRetryS: number): Date => {
  const secondToMilliseconds = 1000;
  return new Date(
    new Date().getTime() + timeBeforeRetryS * secondToMilliseconds,
  );
};

export default getRetryDisabledUntil;
