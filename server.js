"use strict";

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { response } = require("express");

const server = express();
server.use(cors());
server.use(express.json());
require("dotenv").config();
const PORT = process.env.PORT;

// proof of life
server.get("/", (req, res) => {
  res.send("All Set");
});

server.get("/trinding", async (req, res) => {
  await axios({
    url: "https://api.igdb.com/v4/search",
    method: "POST",
    headers: {
      Accept: "application/json",
      Client_ID: `${process.env.GAMES_CLIENT_ID}`,
      Authorization: `Bearer ${process.env.GAMES_SECRET_KEY}`,
    },
  })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      //   console.log(error);
      console.log("inside the error");
    });
});

server.listen(PORT, () => {
  console.log(`Listening On PORT ${PORT}`);
});
