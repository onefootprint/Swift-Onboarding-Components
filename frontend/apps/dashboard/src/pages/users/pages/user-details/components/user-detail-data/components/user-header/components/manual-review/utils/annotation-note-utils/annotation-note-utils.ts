export type AnnotationNote = {
  reason: string;
  note?: string;
};

export const stringifyAnnotationNote = ({ reason, note }: AnnotationNote) => {
  const json = { reason: reason ?? '', note };
  return JSON.stringify(json);
};

export const parseAnnotationNote = (annotation: string): AnnotationNote => {
  let reason;
  let note;
  try {
    const json = JSON.parse(annotation);
    reason = json.reason;
    note = json.note;
  } catch {
    reason = '';
  }

  return { reason, note };
};
