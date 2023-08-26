import { MongoClient } from 'mongodb';
import { log } from '../lib';

export const mongo: any = {};

const dbName = 'nodeCoders';

export const connect = async (url: string) => {
  try {
    if (!url) {
      throw new Error('Missing url');
    }
    const client = new MongoClient(url);
    await client.connect();
    mongo.db = client.db(dbName);
    log.info('Mongodb connected to db:', dbName);
  } catch (err) {
    log.error(err);
  }
};
