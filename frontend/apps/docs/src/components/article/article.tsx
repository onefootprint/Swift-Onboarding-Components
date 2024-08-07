import SEO from 'src/components/seo';

import type { Article } from '../../types/article';
import Markdown from '../markdown';
import ArticleHeader from './components/article-header';

type ArticleProps = {
  article: Article;
};

const ArticlePage = ({ article }: ArticleProps) => (
  <>
    <SEO description={article.data.meta.description} slug={article.data.slug} title={article.data.meta.title} />
    <ArticleHeader title={article.data.title} subtitle={article.data.readingTime.text} />
    <Markdown id="article-content">{article.content}</Markdown>
  </>
);

export default ArticlePage;
