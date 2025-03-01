import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

redis.on('connect', () => {
    console.log('Connected to Redis')
})

redis.on('error', (err) => {
    console.error('Error connecting to Redis: ', err)
})

export default redis;