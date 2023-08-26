import { mongo } from './mongo';
import { log } from '../lib';

export const createCollections = async (collections: string[] = []): Promise<void> => {
  const existingCollections = await mongo.db.listCollections().toArray();
  const existingNames = existingCollections.map((e) => e.name);
  const missingCollections = collections.filter((name) => !existingNames.includes(name));
  for (let i = 0; i < missingCollections.length; i++) {
    log.debug('creating collection:', missingCollections[i]);
    await mongo.db.createCollection(missingCollections[i]);
  }
};

export const createIndex = async (collection: string, index: object) => {
  return await mongo.db.collection(collection).createIndex(index);
};

export const findOneAndDelete = async (collection, filter) => {
  return await mongo.db.collection(collection).findOneAndDelete(filter);
};

export const deleteMany = async (collection, filter) => {
  return await mongo.db.collection(collection).deleteMany(filter);
};

export const findOne = async (collection, query = {}, project = {}) => {
  return await mongo.db.collection(collection).findOne(query, project);
};

export const find = async (collection, query = {}, projection = {}) => {
  const opts = { projection };
  const result = await mongo.db.collection(collection).find(query, opts).toArray();
  return result;
};

export const insertOne = async (collection, doc) => {
  return await mongo.db.collection(collection).insertOne(doc);
};

export const insertMany = async (collection, docs) => {
  return await mongo.db.collection(collection).insertMany(docs);
};

/*
   {
     upsert: <boolean>,
     writeConcern: <document>,
     collation: <document>,
     arrayFilters: [ <filterdocument1>, ... ],
     hint:  <document|string>        // Available starting in MongoDB 4.2.1
   }
*/
export const updateMany = async (collection, filter, update) => {
  return await mongo.db.collection(collection).updateMany(filter, { $set: update });
};

export const findOneAndUpdate = async (collection, filter, update) => {
  return await mongo.db.collection(collection).findOneAndUpdate(filter, { $set: update });
};

export const addToArray = async (collection, filter, update) => {
  return await mongo.db.collection(collection).updateOne(filter, { $push: update });
};

export const updateArrayByField = async (collection, filter, updates) => {
  return await mongo.db.collection(collection).findOneAndUpdate(filter, {
    $set: updates,
  });
};

export const removeFromArray = async (collection, filter, update) => {
  return await mongo.db.collection(collection).updateOne(filter, {
    $pull: update,
  });
};
