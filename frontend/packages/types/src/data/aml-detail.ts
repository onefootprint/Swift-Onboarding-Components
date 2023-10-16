export type AmlDetail = {
  shareUrl: string | null;
  hits: AmlHit[];
};

export type AmlHit = {
  name: string | null;
  matchTypes: string[] | null;
  fields: Record<string, string> | null;
  media: AmlHitMedia[] | null;
};

export type AmlHitMedia = {
  date: string | null;
  pdfUrl: string | null;
  snippet: string | null;
  title: string | null;
  url: string | null;
};
