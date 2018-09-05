var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

const app = express();
app.use(cors());

// connect to db
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('db connected \n\n');
});

// http listenser
app.listen(3000, () => {
    console.log('Server Started!')
})

// api routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var data;

app.get('/workflow/diagrams', function (req, res) {
    var temp = db.collection('workflows').find({})
        .toArray(function (error, data) {
            if (error) throw error;
            res.send(data);
        });
});

app.post('/workflow/save', function (req, res, next) {
    data = req.body.value;

    var data = JSON.parse(data);
    var filter = { 'name': data['name'] };
    var update = { $set: data };
    options = { upsert: true };

    console.log(data);
    // insert into db if record not found
    db.collection('workflows').findOneAndUpdate(filter, update, options, function (error, result) {
        if (error) {
            console.log(error);
            return;
        }
        // do something to returned document - result
        console.log(result);
    });
    // db.collection('workflows').insertOne(JSON.parse(data));
    res.send(data);
});

app.get('/workflow/diagrams', function (req, res) {
    var temp = db.collection('workflows').find({})
        .toArray(function (error, data) {
            if (error) throw error;
            res.send(data);
        });
});