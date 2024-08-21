import type { HydratedApiArticle } from '../../hooks/use-hydrate-articles';

export type PageNavProps = {
  sections: PageNavSection[];
};

export type PageNavSection = {
  title: React.ReactNode;
  /** `id` of the content for this section header. Can be undefined if there is no corresponding content section for this header */
  id?: string;
  subsections: {
    title: React.ReactNode;
    /** `id` of the content for this subsection. */
    id: string;
    api?: HydratedApiArticle;
  }[];
};
