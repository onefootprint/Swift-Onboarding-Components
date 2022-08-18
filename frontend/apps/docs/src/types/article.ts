export type ArticleSection = {
  anchor: string;
  id: string;
  label: string;
  level: number;
};

export type Article = {
  content: string;
  data: {
    position: number;
    product: string;
    sections: ArticleSection[];
    slug: string;
    title: string;
  };
};
