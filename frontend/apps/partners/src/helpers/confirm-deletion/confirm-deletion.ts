import type { TFunction } from 'i18next';

type T = TFunction<'common'>;
type EventFn = (e: Event) => void;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type OpenConfirm = (x: any) => void;

export type WithConfirm = (yesFn: EventFn) => (ev: Event) => void;

const confirmDeletion = (t: T, openConfirm: OpenConfirm) => (yesFn: EventFn) => (ev: Event) => {
  openConfirm({
    title: t('are-you-sure'),
    description: t('cannot-be-undone'),
    primaryButton: { label: t('yes'), onClick: () => yesFn(ev) },
    secondaryButton: { label: t('no') },
  });
};

const confirmDocSubmission = (t: T, openConfirm: OpenConfirm) => (doc: string, yesFn: EventFn) => (ev: Event) => {
  openConfirm({
    title: t('doc.cancel-submission'),
    description: t('doc.no-longer-required-confirm', { doc }),
    primaryButton: { label: t('yes'), onClick: () => yesFn(ev) },
    secondaryButton: { label: t('no') },
  });
};

export { confirmDocSubmission };
export default confirmDeletion;
