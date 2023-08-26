import { curry } from '../..';

export const find = curry(<A>(fn: (v: A, index?: number, array?: A[]) => any, array: A[]) => array.find(fn));

// const findFn = ({isEnabled}) => isEnabled;

/*

Argument of type '({ isEnabled }: { isEnabled: any; }) => any' is not assignable to parameter of type '(v: unknown, index?: number | undefined, array?: unknown[] | undefined) => any'.
  Types of parameters '__0' and 'v' are incompatible.
    Type 'unknown' is not assignable to type '{ isEnabled: any; }'.

    */
