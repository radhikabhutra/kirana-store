export type PartialUntyped<T> = {
  [K in keyof T]?: any;
};
