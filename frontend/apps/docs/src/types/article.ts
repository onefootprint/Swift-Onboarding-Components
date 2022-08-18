export type ArticleSection = {
  anchor: string;
  id: string;
  label: string;
  level: number;
};

export type ArticleMeta = {
  title: string;
  description: string;
};

export type Article = {
  content: string;
  data: {
    meta: ArticleMeta;
    position: number;
    product: string;
    sections: ArticleSection[];
    slug: string;
    title: string;
  };
};
