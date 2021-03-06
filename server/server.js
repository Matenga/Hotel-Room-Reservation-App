var express = require('express');
var app = express();

var mongoose = require('mongoose');
var logger = require('morgan');

var bodyParser = require('body-parser');
var cors = require('cors');

// Configuration
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/hotels', { useMongoClient: true });

// Parses urlencoded bodies
app.use(bodyParser.urlencoded({extended: false}));

// Send JSON responses
app.use(bodyParser.json());

// Log requests
app.use(logger('dev'));

// Manages the CORS
app.use(cors());

// Models
var Room = mongoose.model('Room', {
    room_number: Number,
    type: String,
    beds: Number,
    max_occupancy: Number,
    cost_per_night: Number,
    reserved: [
        {
            from: String,
            to: String
        }
    ]
});



/*
 * Generate some test data, if no records exist already
 * MAKE SURE TO REMOVE THIS IN PROD ENVIRONMENT
 */

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Room.remove({}, function(res){
  // console.log("Matenga You Have Removed records");
//});


Room.count({}, function(err, count){
    console.log("Matenga, " + count + " Rooms Are Available");

    if(count === 0){

        var recordsToGenerate = 350;

        var roomTypes = [
            'Single',
            'Single Standard',
            'Delux',
            'Executive'
        ];

        // For testing purposes, all rooms will be booked out from:
        // 18th May 2017 to 25th May 2017, and
        // 29th Jan 2018 to 31 Jan 2018

        for(var i = 0; i < recordsToGenerate; i++){
            var newRoom = new Room({
                room_number: i,
                type: roomTypes[getRandomInt(0,3)],
                beds: getRandomInt(1, 6),
                max_occupancy: getRandomInt(1, 8),
                cost_per_night: getRandomInt(50, 500),
                reserved: [
                    {from: '1970-01-01', to: '1970-01-02'},
                    {from: '2017-04-18', to: '2017-04-23'},
                    {from: '2018-01-29', to: '2018-01-30'}
                ]
            });

            newRoom.save(function(err, doc){
                console.log( "Matenga You test document ==> " + doc._id + "Has been Successfully created" );
            });
        }

    }
});




// Routes

app.post('/api/rooms', function(req, res) {

    Room.find({
        type: req.body.roomType,
        beds: req.body.beds,
        max_occupancy: {$gt: req.body.guests},
        cost_per_night: {$gte: req.body.priceRange.lower, $lte: req.body.priceRange.upper},
        reserved: {

            //Check if any of the dates the room has been reserved for overlap with the requsted dates
            $not: {
                $elemMatch: {from: {$lt: req.body.to.substring(0,10)}, to: {$gt: req.body.from.substring(0,10)}}
            }

        }
    }, function(err, rooms){
        if(err){
            res.send(err);
        } else {
            res.json(rooms);
        }
    });

});

app.post('/api/rooms/reserve', function(req, res) {

    console.log(req.body._id);

    Room.findByIdAndUpdate(req.body._id, {
        $push: {"reserved": {from: req.body.from, to: req.body.to}}
    }, {
        safe: true,
        new: true
    }, function(err, room){
        if(err){
            res.send(err);
        } else {
            res.json(room);
        }
    });

});

// listen
app.listen(8081);
console.log("Matenga, Your App is listening on port 8081");