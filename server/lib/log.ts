import stackTrace from 'stack-trace';
import { isObject } from './functional-utils';
import config from '../config';
import { combineTextsWithPadding } from './utils';

export const buildOutput = (msg = '') => {
  const trace = stackTrace.get();
  const caller = trace[3];
  let file, line;
  if (caller) {
    const path = caller.getFileName();
    const pieces = path.split('/');
    file = pieces[pieces.length - 1];
    line = caller.getLineNumber();
  }
  let out = '';
  if (file && line) {
    out += '[ ' + file + ':' + line + ' ] ';
  }
  return combineTextsWithPadding(out, msg, 15);
};

function combineArgs(args) {
  let text = '';
  for (let i = 0; i < args.length; i++) {
    text += isObject(args[i]) ? JSON.stringify(args[i]) : args[i];
    if (i === args.length - 1) {
      break;
    }
    text += ' ';
  }
  return text.trim();
}

const logLevels = ['debug', 'info', 'warn', 'error'];

function getOutput(args) {
  const combinedArgs = combineArgs(args);
  return buildOutput(combinedArgs);
}

export const error = function (...args) {
  if (logLevels.indexOf('error') < logLevels.indexOf(config.logLevel)) {
    return;
  }
  console.error('error', getOutput(args));
};

export const warn = function (...args) {
  if (logLevels.indexOf('warn') < logLevels.indexOf(config.logLevel)) {
    return;
  }
  console.log('warn', getOutput(args));
};

export const info = function (...args: any[]) {
  if (logLevels.indexOf('debug') < logLevels.indexOf(config.logLevel)) {
    return;
  }
  console.log('info', getOutput(args));
};

export const debug = function (...args) {
  if (logLevels.indexOf('debug') < logLevels.indexOf(config.logLevel)) {
    return;
  }
  console.log('debug', getOutput(args));
};

const onceMsgs = {};
export const once = function (...args) {
  const combined = combineArgs(args);
  if (onceMsgs[combined]) return;
  onceMsgs[combined] = true;
  info(getOutput(args));
};

export const log = {
  debug,
  error,
  info,
  once,
};
