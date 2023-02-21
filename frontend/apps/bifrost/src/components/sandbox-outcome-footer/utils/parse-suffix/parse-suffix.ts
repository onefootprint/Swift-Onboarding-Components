const parseTestID = (suffix: string) => {
  if (suffix.startsWith('#fail')) {
    return { outcome: 'Fail', testID: suffix.replace('#fail', '') };
  }
  if (suffix.startsWith('#manualreview')) {
    return {
      outcome: 'Manual review',
      testID: suffix.replace('#manualreview', ''),
    };
  }
  return { outcome: 'Success', testID: suffix };
};

export default parseTestID;
