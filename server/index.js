const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(pino);

var allowedOrigins = ['http://localhost:3000',
                      'https://plains-paris-pwa.web.app'];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = `The CORS policy for this site does not allow access from ${origin}.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

app.post('/api/messages', (req, res) => {
  res.header('Content-Type', 'application/json');
  let referral_success = false;
  let response = {
    success: false
  };
  client.messages
    .create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: req.body.phone,
      body: `Hello, ${req.body.fullname}! You have been referred to the Plain's Paris App: https://plains-paris-pwa.web.app/`
    })
    .then(() => {
      referral_success = true;
    })
    .catch(err => {
      console.log(err);
    });

    // Tell Plain's Paris about this referral
    if (referral_success)
    {
      client.messages
      .create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.JUSTIN_BERRY_PHONE_NUMBER,
        body: `Hi Justin, ${reg.body.fullname} was just referred to Plain's Paris! Their phone number is ${req.body.phone}.`
      })
      .then(() => {
        response.success = true;
      })
      .catch(err => {
        console.log(err);
      });
    }

    // Send the response
    res.send(JSON.stringify(response));
});

app.listen(process.env.PORT || 3001, () => {
  console.log('Express server is running!');
});

// define the first route
app.get("/", function (req, res) {
  res.send("<h1>Welcome to the Plain's Paris API!</h1>")
})
