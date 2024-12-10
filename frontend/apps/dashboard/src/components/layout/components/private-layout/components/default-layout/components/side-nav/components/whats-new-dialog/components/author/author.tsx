import Image from 'next/image';

type AuthorProps = {
  name: string;
  avatarUrl: string;
};

const Author = ({ name, avatarUrl }: AuthorProps) => (
  <div className="flex items-center gap-3">
    {avatarUrl && (
      <div className="w-8 h-8 overflow-hidden rounded-full">
        <Image alt={`Image of ${name}`} src={avatarUrl} height={32} width={32} className="object-cover w-full h-full" />
      </div>
    )}
    <p className="text-label-3">{name}</p>
  </div>
);

export default Author;
