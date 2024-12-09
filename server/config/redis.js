const redis = require("redis");
const Q = require('q');

function connectRedis() {
    let deferred = Q.defer();
    const redisClient = redis.createClient({
        password: "dTqbBMr3CSl8ogJYp9SyzsHq18uDxMDu",
        socket: {
          host: "redis-13508.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
          port: 13508,
        },
    });
    redisClient.connect();
    
    console.log("Connecting to the Redis");
    
    redisClient.on('connect', ()=>{
        console.log("Connected to Redis");
    });

    redisClient.on("ready", () => {
        console.log("Connected!");
        deferred.resolve(redisClient);
    });

    redisClient.on("error", (err) => {
      console.log("Error in the Connection", err);
    });

    return deferred.promise;
}

module.exports = { connectRedis };
