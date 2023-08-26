type AnyFn = (...args: any) => any;
type SideEffect = (fn: AnyFn) => <T>(v: T) => T;
export const sideEffect: SideEffect = (fn) => (v) => {
  fn(v);
  return v;
};

type AnyFnAsync = (...args: any) => Promise<any>;
type AsyncSideEffect = (fn: AnyFnAsync) => <T>(v: T) => Promise<T>;
export const asyncSideEffect: AsyncSideEffect = (fn) => async (v) => {
  await fn(v);
  return Promise.resolve(v);
};
