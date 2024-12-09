const { connectRedis } = require("../config/redis.js");

const redisCalls = async (type, method, key, expiryValue, value) => {
  let res;
  await connectRedis().then(async (client) => {
    if (method === "set") {
      if (type === "hash") {
        res = setHash(client, key, value, expiryValue);
      } else if (type === "string") {
        res = setString(client, key, value, expiryValue);
      }
    } else if (method === "get") {
      if (type === "hash") {
        res = getHash(client, key);
      } else if (type === "string") {
        res = getString(client, key);
      }
    } else if (method === "ttl") {
      res = timeToLive(client, key);
    } else if (method === "del") {
      res = invalidateCache(client, key);
    }
  });
  return res;
};

const setHash = async (client, key, value, expiryValue) => {
  const data = await client.hSet(key, value);
  if (data) {
    await client.expire(key, expiryValue);
    return true;
  }
  return false;
};

const getHash = async (client, key) => {
  const exist = await client.exists(key);
  if (!exist) return null;
  const res = await client.hGetAll(key);
  return res;
};

const setString = async (client, key, value, expiryValue) => {
  value = JSON.stringify(value);
  const data = await client.set(key, value);
  if (data) {
    await client.expire(key, expiryValue);
    return true;
  }
  return false;
};

const getString = async (client, key) => {
  const exist = await client.exists(key);
  if (!exist) return null;
  const res = await client.get(key);
  return JSON.parse(res);
};

const timeToLive = async (client, key) => {
  const ttl = await client.ttl(key);
  return ttl;
};

const invalidateCache = async (client, key) => {
  const response = await client.del(key);
  console.log(response);
  return response;
};

module.exports = { redisCalls };
