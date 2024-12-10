import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoArrowUpRight16 } from '@onefootprint/icons';
import { Dialog, LinkButton } from '@onefootprint/ui';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import type { PostDetails } from '../../side-nav.types';
import Author from './components/author';
import DateRow from './components/date-row';
import HtmlContent from './components/html-content';

type WhatsNewDialogProps = {
  onClose: () => void;
  open: boolean;
  posts: PostDetails[];
};

const WhatsNewDialog = ({ open, onClose, posts }: WhatsNewDialogProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.private-layout.nav' });

  return (
    <>
      <Dialog open={open} onClose={onClose} title={t('whats-new.title')}>
        <div className="flex flex-col min-h-[400px] gap-5">
          {posts.map((post: PostDetails) => (
            <article
              key={post.uuid}
              className="flex flex-col overflow-hidden border border-solid rounded border-tertiary"
            >
              <Image
                src={post.featureImage}
                alt={post.title}
                width={800}
                height={800}
                className="object-cover w-full h-full"
              />
              <div className="flex flex-col items-start justify-between p-6">
                <div className="flex flex-col w-full gap-4 mb-5">
                  <DateRow publishedAt={post.publishedAt} slug={post.slug} />
                  <h2 className="text-heading-2">{post.title}</h2>
                  <Author name={post.primaryAuthor.name} avatarUrl={post.primaryAuthor.profileImage} />
                </div>
                <HtmlContent html={post.html} />
              </div>
            </article>
          ))}
          <div className="flex flex-col justify-center gap-2 my-3 text-center">
            <p className="text-label-3 text-tertiary">{t('whats-new.want-to-know-more')}</p>
            <div>
              <LinkButton variant="label-3" iconComponent={IcoArrowUpRight16} href={`${FRONTPAGE_BASE_URL}/changelog`}>
                {t('whats-new.view-full-changelog')}
              </LinkButton>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default WhatsNewDialog;
