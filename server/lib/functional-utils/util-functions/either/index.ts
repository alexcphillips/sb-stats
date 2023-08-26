import { curry } from '../curry';
type EvaluatorType = Function | any;

export const either = curry((evaluator: EvaluatorType, success: Function, fail: Function) => (...args: any) => {
  const evaluated = typeof evaluator === 'function'
    ? evaluator(...args)
    : evaluator;
  return Boolean(evaluated) ? success(...args) : fail(...args);
});
