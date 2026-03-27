import { QueryTypes } from "sequelize";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';

import { sequelize } from "../models";

// this is a stop gap implementation for creating unique ids for a course using
// this library, this will not be good in the future as we will start to spend
// more time trying to find a unique id. unless the size of the dictionaries
// change (2026/03/20) then the total amount of ids that we can create is
// 22_188_920. around 5800 unique ids we can start to see about a 53% chance of
// getting a duplicate id (birthday problem).

// also note that this will not work when more than one api server exists. this
// will only work when one server instance is created otherwise we will need to
// rely on the database more which will include more problems to deal with

// we could do this by parsing the database errors when attempting to create a
// new course and checking for constraint errors on the index / primary key.
// we can save on network calls and database calls by having the server keep
// track of them. again as stated above, this will only work if there is a
// single instance of the server otherwise we will not know what servers are
// generating what keys and will start getting database errors thus making this
// code pointless.

// represents a generated id that has not been commited
interface TmpId {
  id: number,
  ts: number,
}

let initialized = false;
let initialized_promise = null;

// this will track the known and commited
let known_ids: Set<string>[] = [new Set()];
// this will track ids that have been created but not commited
let tmp_ids: Map<string, TmpId> = new Map();
// index to lookup the id quickly when attempting to commit a generated id
let ids_index: Map<number, string> = new Map();
// unless the size of the dictionaries change, this is a number we can actually
// count to
let max_ids = adjectives.length * colors.length * animals.length;

// if it takes us more than this amount to create a unique id then we are going
// to bail
let max_attempts = 1000;
// this will be a counter for the amount of requests made for a new id is
// generated.
let id_count = 0;
// the interval reference for cleaning up, not sure where the type definition
// for this is so it will be unset
let interval_id;

// private function to add a name to the known_ids dictionary
function add_name(name: string) {
  // encountered an error where the set was too large ~16_000_000 so we will
  // append to the last Set
  if (known_ids[known_ids.length - 1].size === 10_000_000) {
    known_ids.push(new Set());
  }

  return known_ids[known_ids.length - 1].add(name)
}

// private function to check if a name exists in the known_ids
function has_name(name: string) {
  for (let group of known_ids) {
    if (group.has(name)) {
      return true;
    }
  }

  return false;
}

// private function to get the total amount of known_ids
function total_names() {
  let total = 0;

  for (let group of known_ids) {
    total += group.size;
  }

  return total;
}

// attempt to generate a new course id, returning if the generation was
// successful, the name generated, and the id associated with the generation
// request. the number id will be used to either commit or rollback the
// generated id. this will fail if all ids have been generated or if the amount
// of generated attempts reaches the designated max
export function generate_id(): [boolean, string, number] {
  if (!initialized) {
    throw new Error("generated ids has not been initialized");
  }

  if (total_names() >= max_ids) {
    return [false, "", 0];
  }

  let successful = false;
  let id = id_count += 1;
  let name: string = "";

  let attempt = 1;

  while (attempt <= max_attempts) {
    // we are not going to provide a seed for now and just the Math.random()
    // that the library will default to
    name = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: '-',
    });

    if (!has_name(name) && !tmp_ids.has(name)) {
      successful = true;
      break;
    }

    attempt += 1;
  }

  if (successful) {
    ids_index.set(id, name);
    tmp_ids.set(name, {
      id,
      ts: Date.now(),
    });
  }

  return [successful, name, id];
}

// commits the generated id to the list of known_ids, returns false if the id
// is unknown to the system
export function commit_id(id: number): boolean {
  let name = ids_index.get(id);

  if (name == null) {
    return false;
  }

  add_name(name);

  tmp_ids.delete(name);
  ids_index.delete(id);

  return true;
}

// rolls back the generated id to be used elsewhere, returns false if the id
// is unknown to the system
export function rollback_id(id: number): boolean {
  let name = ids_index.get(id);

  if (name == null) {
    return false;
  }

  tmp_ids.delete(name);
  ids_index.delete(id);

  return true;
}

// queries the database for a list of all known course ids and adds them to the
// list of known_ids
async function sync_ids() {
  // the database keeps track of the uids through an index so it will be unique
  // and act as the source of truth for the server
  const results = await sequelize.query(
    "select id from courses",
    { type: QueryTypes.SELECT }
  );

  for (let record of results) {
    //@ts-ignore
    add_name(record.id);
  }
}

// cleans up tmp_ids that are older than 30 seconds
function clean_tmp() {
  let now = Date.now();
  // 30 seconds is the max lifetime for a tmp id
  let max_lifetime = 30 * 1000;
  let deleted = 0;

  for (let key of Object.keys(tmp_ids)) {
    if (now - tmp_ids[key].ts > max_lifetime) {
      ids_index.delete(tmp_ids[key].id);
      tmp_ids.delete(key);
      deleted += 1;
    }
  }

  if (deleted > 0) {
    console.warn("WARN: tmp_ids are not being commited or rolled back");
  }
}

// initializes the id generator, should be called before handling requests
export async function init(): Promise<boolean> {
  if (!initialized) {
    if (initialized_promise != null) {
      console.log("awaiting iniailization");

      await initialized_promise;
    } else {
      console.log("initializing server ids");

      initialized_promise = sync_ids();

      await initialized_promise;

      // run cleanup of tmp_ids every 15 seconds, no this will not be exact and
      // does not need to be
      interval_id = setInterval(() => clean_tmp(), 15 * 1000);

      initialized = true;
    }

    return true;
  } else {
    console.log("already initialized");

    return false;
  }
}
