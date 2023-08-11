const parseTestID = (suffix: string) => {
  if (suffix.startsWith('fail')) {
    return { outcome: 'Fail', testID: suffix.replace('fail', '') };
  }
  if (suffix.startsWith('manualreview')) {
    return {
      outcome: 'Manual review',
      testID: suffix.replace('manualreview', ''),
    };
  }
  if (suffix.startsWith('document_decision')) {
    return {
      outcome: 'Based on ID decision',
      testID: suffix.replace('document_decision', ''),
    };
  }
  return { outcome: 'Success', testID: suffix };
};

export default parseTestID;
