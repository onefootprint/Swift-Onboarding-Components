import { Link } from 'react-scroll';
import NavigationLink from 'src/components/markdown/components/navigation-link';
import { ARTICLES_CONTAINER_ID } from '../../api-reference/components/articles/articles';

type ScrollLinkProps = {
  id: string;
  children: string;
  onClick?: () => void;
};

/** Handy component to use in mdx to reference other APIs on the same page. */
const ScrollLink = ({ id, children, onClick }: ScrollLinkProps) => (
  <NavigationLink
    activeClass="active"
    containerId={ARTICLES_CONTAINER_ID}
    hashSpy
    spy
    data-id={id}
    to={id}
    href={`#${id}`}
    onClick={onClick}
    LinkElement={Link}
  >
    {children}
  </NavigationLink>
);

export default ScrollLink;
