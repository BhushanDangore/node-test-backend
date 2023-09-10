const express = require("express");
const { MongoClient } = require("mongodb");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const ServerlessHttp = require("serverless-http");

const MailgunKey = "70fa8781800c1b9cdac4a2085fa22dc6-7ca144d2-b35c9613";
const MailgunURL = "sandboxe6e01fd85dfa41b49e67bdfa25dc5558.mailgun.org";
const MailgunFromUser = "Excited User <mailgun@sandboxe6e01fd85dfa41b49e67bdfa25dc5558.mailgun.org>";

const MongoURI =
  "mongodb+srv://rupalidabraserd:CpELvBDygRoOaKWN@cluster0.e6ala7p.mongodb.net/sop_db?retryWrites=true&w=majority";

const FEHostURL = 'http://127.0.0.1:5500';

const mailgun = new Mailgun(formData);
const MailGunClient = mailgun.client({
  username: "api",
  key: MailgunKey,
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const getDatabase = async () => {
  const mongoClient = await MongoClient.connect(MongoURI);
  const database = mongoClient.db("sop_db");
  return database;
};

app.post("/create-admin", async (req, res) => {
  const admin = {
    name: req.body.name,
    email: req.body.email,
  };

  const db = await getDatabase();

  db.collection("admin")
    .insertOne(admin)
    .then(() => {
      console.log("Admin user created");

      res.status(200).json({
        success: true,
        message: "Admin account created",
      });
    });
});

app.get("/admin", async (req, res) => {
  const db = await getDatabase();

  db.collection("admin")
    .find({})
    .toArray()
    .then((documents) => {
      res.send(documents);
      res.end();
    });
});

app.get("/response", async (req, res) => {
  const db = await getDatabase();

  db.collection("responses")
    .find({})
    .toArray()
    .then((documents) => {
      res.send(documents);
      res.end();
    });
});

app.post("/add-response", async (req, res) => {
  const response = {
    FullName: req.body.FullName,
    Email: req.body.Email,
    Age: parseInt(req.body.Age),
    HighestLevelOfEducation: req.body.level,
    Institutewhereyoucompletedyourhighestlevelofeducation:
      req.body.completionPlace,
    Whatdidyoustudy: req.body.studyField,
    Doyouhaveanyrelevantworkexperience: req.body.experienceanswer,
    WhatinstitutedidyougetadmittedtoinCanada: req.body.admitted,
    WhatisyourprogramofstudyinCanada: req.body.program,
    Whichcountryareyouapplyingfrom: req.body.country,
    Whatareyourfuturegoals: req.body.goal,
    EnglishScoresListening: parseInt(req.body.listening),
    EnglishScoresReading: parseInt(req.body.reading),
    EnglishScoresSpeaking: parseInt(req.body.speaking),
    EnglishScoresWriting: parseInt(req.body.writing),
    didyoupayfirstyearfee: req.body.firstyear,
    Didyoupayyourfirstyeartuition: req.body.fee,
    DidyoupayforGIC: req.body.fee,
    HowmuchdidyoupaytowardGIC: parseInt(req.body.GICpay),
  };
  MailGunClient.messages
    .create(MailgunURL, {
      from: MailgunFromUser,
      to: [response.Email],
      subject: `Hello, ${response.FullName}`,
      html: `<pre>${JSON.stringify(response, 2, 2)}</pre>`,
    })
    .then((msg) => console.log(msg)) // logs response data
    .catch((err) => console.log(JSON.stringify(err))); // logs any error

  const db = await getDatabase();

  db.collection("responses")
    .insertOne(response)
    .then(() => {
      console.log("User response posted");
      res.redirect(`${FEHostURL}/public/response.html`);
      res.end();
    });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server Started`);
});

// module.exports.handler = ServerlessHttp(app);
