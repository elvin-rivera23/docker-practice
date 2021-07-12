// import libraries
const express = require("express");
// Using Node.js `require()`
const mongoose = require('mongoose');
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");

let RedisStore = require('connect-redis')(session)


const {
    MONGO_USER, 
    MONGO_PASSWORD, 
    MONGO_IP, 
    MONGO_PORT,
    REDIS_URL,
    SESSION_SECRET,
    REDIS_PORT,
 } = require("./config/config");

 let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT,
});

 const postRouter = require("./routes/postRoutes");
 const userRouter = require("./routes/userRoutes");

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
    mongoose
    .connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,

    })
    .then(() => console.log("successfully connected to DB"))
    .catch((e) => {
        console.log(e)
        setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}));

app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 60000,
    }
}));

app.use(express.json()); //middleware, body gets attached to request object


/* 
    find out the ip of a docker container
    docker inspect [container name]
    port number is found under "Ports" of that inspect

    VERY SLOPPY SO, custom networks use docker network ls

    and refere to the SERVICE NAME (usually in the compose file)


*/

app.get("/api/v1", (req, res) => {
    res.send("<h2>Hi There</h2>");
    console.log("yeah it ran");
});

// install cors to allow communication from differend domains

//localhost:3000/posts
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);
const port = process.env.PORT || 3000;

app.listen(port, () => console.log('listening on port ${PORT}'));

// to test go on web browser and type localhost:3000
// do research for nodemon on package.json
// run on docker on ubuntu