import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { log } from './log';

export const makeId = () => uuidv4();

export const combineTextsWithPadding = (firstText = '', secondText = '', minWidth = 50) => {
  const paddingNum = minWidth - firstText.length;
  let padding = '';
  if (paddingNum > 0) {
    [...Array(paddingNum)].forEach((_) => {
      padding += ' ' || _;
    });
  }
  return `${firstText}${padding}${secondText}`;
};

export const clearConsole = (msg = 'cleared console') => {
  process.stdout.write('\u001b[3J\u001b[1J');
  console.clear();
  log.debug(msg);
};
export const isDev = (): boolean => process.env.NODE_ENV === 'development';

export const removeObjectKeys = (obj, removeKeys = []) => {
  const excludeKeys = new Set(removeKeys);
  const filteredPairs = Object.entries(obj).filter(([key]) => !excludeKeys.has(key));
  return Object.fromEntries(filteredPairs);
};

export const verifyPropsExist = (obj, props: string[] = [], prefix = '', doNotThrow = false) => {
  const missingProps = props.filter((prop) => !obj.hasOwnProperty(prop));
  if (missingProps.length) {
    const errMsg = `${prefix} Missing required props: ${missingProps.join(', ')}`;
    if (doNotThrow) {
      log.error(errMsg);
      return;
    }
    throw new Error(errMsg);
  }
};
