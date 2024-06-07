import type { DocTemplate } from '@/queries/get-partner-doc-templates';
import type { PartnerDocument } from '@/queries/get-partner-partnerships-documents';

type Option = { label: string; value: string };
type TemplateOption = { label: string; value: string; templateId: string };

const join = (...args: unknown[]): string => args.filter(Boolean).join(' ');

export const EmptyCompany = {
  companyName: '',
  numControlsComplete: 0,
  numControlsTotal: 0,
};

export const sortByLastUpdatedDesc = (a: { lastUpdated?: string }, b: { lastUpdated?: string }) =>
  a.lastUpdated && b.lastUpdated ? new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime() : 0;
export const sortByTimestampDesc = (a: { timestamp?: string }, b: { timestamp?: string }) =>
  a.timestamp && b.timestamp ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() : 0;

export const percentageCalc = (c: typeof EmptyCompany): number =>
  c.numControlsTotal === 0 ? 0 : (100 * c.numControlsComplete) / c.numControlsTotal;

export const getDocLabelValue = (x: DocTemplate): TemplateOption => ({
  label: x.latestVersion.name,
  value: x.latestVersion.id,
  templateId: x.id,
});

export const getMemberLabelValue = (x: {
  firstName?: string;
  lastName?: string;
  id: string;
}): Option => ({
  label: join(x.firstName, x.lastName) || '',
  value: x.id,
});

export const getUnusedTemplates = (
  documents: PartnerDocument[],
  templates: TemplateOption[],
): Omit<TemplateOption, 'templateId'>[] => {
  const setOfTemplateIds = documents.reduce((set, x) => {
    if (x.templateId) set.add(x.templateId);
    return set;
  }, new Set());

  return templates.filter(x => !setOfTemplateIds.has(x.templateId)).map(x => ({ value: x.value, label: x.label }));
};
