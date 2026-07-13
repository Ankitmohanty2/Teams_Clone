const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server,{
    debug: true
})

const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');

// Database Connection
mongoose.connect(process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/stream_connect').then(() => {
    console.log("Connected to MongoDB successfully");
}).catch((err) => {
    console.log("MongoDB connection error: ", err);
});

app.use(express.urlencoded({extended:true}));
app.use(express.json()); // Add JSON body parser

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'streamconnect_super_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/stream_connect' }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Make user session available to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.set('view engine', 'ejs')
app.set('views', "./frontend/views")

app.use(express.static("frontend/public"));
app.use("/peerjs",peerServer);

app.use("/", require("./backend/routes/routes"));

require("./backend/sockets/index")(io);

const PORT = process.env.PORT || 8000;
server.listen(PORT,()=>{
    console.log(`Express server is running on port ${PORT}`);
});