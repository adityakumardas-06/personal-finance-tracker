// cache.js
import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

let alreadyLogged = false;

client.on('error', (err) => {
  if (!alreadyLogged) {
    console.error('Redis error (ignore if Redis not installed):', err.message);
    alreadyLogged = true;
  }
});

let connected = false;

export async function initRedis() {
  if (connected) return;
  try {
    await client.connect();
    connected = true;
    console.log('Redis connected');
  } catch (err) {
    // yaha sirf ek baar error upar log hoga
  }
}

export const redisClient = client;

export function isRedisReady() {
  return connected && client.isOpen;
}