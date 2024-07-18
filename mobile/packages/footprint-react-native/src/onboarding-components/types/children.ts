type ChildrenFunction<T> = (options: T) => React.ReactNode | React.ReactNode[];

type Children = React.ReactNode | React.ReactNode[];

export type ChidrenOrFunction<T> = ChildrenFunction<T> | Children;
