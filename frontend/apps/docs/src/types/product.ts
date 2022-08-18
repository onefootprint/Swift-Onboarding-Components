export type ProductArticle = {
  name: string;
  title: string;
  slug: string;
};

export type Product = {
  name: string;
  articles: ProductArticle[];
};
