const express = require('express');
const server = express();
const router = express.Router();
const PORT = 3000;

const bodyparser = require('body-parser');
server.use(bodyparser.json());
server.use(bodyparser.urlencoded({extended: false}));

const mongoose = require('mongoose');
const dbconfig = require('./config/database');
mongoose.Promise = global.Promise;

const cors = require('cors');
server.use(cors({
    origin: 'http://localhost:4200'
}));

const path = require('path');

const authentication = require('./routes/authentication')(router);

mongoose.connect(dbconfig.uri + dbconfig.db, {useMongoClient: true}, function(err){

    if(err)
    {

        console.log("Could Not Connect to Database: " + err);

    }
    else
    {

        console.log("Your URI Link Is: " + dbconfig.uri + dbconfig.db);
        console.log("Your Secret Key Is: " + dbconfig.secret);
        console.log("Connected to Database: " + dbconfig.db);

    }

});




server.use(express.static(__dirname + '/client/dist/'))

server.use('/authentication', authentication);

server.get('*', function(req, res){

    res.sendFile(path.join(__dirname, '/client/dist' ));

})


server.listen(PORT, function(){

    console.log( "TivFit Server Started On Port: " + PORT );

})