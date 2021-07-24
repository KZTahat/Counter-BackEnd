"use strict";

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const { response } = require("express");
const utilities = require("./Models");

const server = express();
server.use(cors());
server.use(express.json());
require("dotenv").config();
const PORT = process.env.PORT;

// proof of life
server.get("/", (req, res) => {
  res.send("All Set");
});

// connecting to mongo database
mongoose.connect(`${process.env.MONGO_DATABASE}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// reciving request at /trnding endPoint
server.get("/getlists", getTrendingMovies);

async function getTrendingMovies(req, res) {
  let flag = false;
  try{
    await utilities.movieModel.find((error, data) => {
      if (error) {
      } else {
        if (data.length == 0) {
          flag = true;
        } else {
          res.send(data);
        }
      }
    });
  } catch(error){
    console.log('Model Error Line 33');
  }
  try {
    if (flag == true) {
      let response = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIES_DB_API_KEY}&query=a`
      );
      const filteredData = response.data.results.map((element) => {
        const {
          original_title,
          overview,
          poster_path,
          release_date,
          vote_average,
          vote_count,
        } = element;
        const addedObject = {
          original_title: original_title,
          overview: overview,
          poster_path: poster_path,
          release_date: release_date,
          vote_average: vote_average,
          price: vote_count, // :) Just For Practising Checkout Button in Cart :)
        };
        new utilities.movieModel({
          original_title: original_title,
          overview: overview,
          poster_path: poster_path,
          release_date: release_date,
          vote_average: vote_average,
          price: vote_count,
        }).save();
        return addedObject;
      });
      res.send(filteredData);
    }
  } catch (error) {
    console.log("something went wrong TRENDING");
  }
}

// reciving request at /updatecart endPoint
server.put("/updatecart/:id", updateCart);

function updateCart(req, res) {
  let id = req.params.id;
  let { original_title } = req.query;
  utilities.movieModel.findOne(
    { original_title: original_title },
    (error, data) => {
      if (error) {
        return "something went wrong UPDATING";
      } else {
        const addedToCartMovie = new utilities.moviesCart({
          id: id,
          counts: 1,
          limit: 10,
          original_title: data.original_title,
          price: data.price,
        });
        addedToCartMovie.save();
        res.send(addedToCartMovie);
      }
    }
  );
}

// reciving requset as /getcartitems endPoint
server.get("/getcartitems", getCartItems);

function getCartItems(req, res) {
  // let cartItems = [];
  utilities.moviesCart.find((error, data) => {
    if (error) {
      return "something went wrong GETTING CART ITEMS";
    } else {
      res.send(data);
    }
  });
}

// reciving requset as /decreascount endPoint
server.put("/decreascount/:id", decrementingCounts);

function decrementingCounts(req, res) {
  const id = req.params.id;
  utilities.moviesCart.find({ id: id }, (error, data) => {
    if (error) {
      return "something went wrong DECREMENTING COUNTS";
    } else {
      if (data[0].counts > 1) {
        data[0].counts--;
      }
      data[0].save();
      res.send(data[0]);
    }
  });
}

// reciving requset as /increascounts endPoint
server.put("/increascounts/:id", incrementingCounts);

function incrementingCounts(req, res) {
  const id = req.params.id;
  utilities.moviesCart.find({ id: id }, (error, data) => {
    if (error) {
      return "something went wrong Incrementing Counts";
    } else {
      if (data[0].counts < data[0].limit) {
        data[0].counts++;
      }
      data[0].save();
      res.send(data[0]);
    }
  });
}

// reciving requset as /deleteitem endPoint
server.delete("/deleteitem/:id", deleteCartItem);

function deleteCartItem(req, res) {
  const id = Number(req.params.id);
  utilities.moviesCart.find((error, data) => {
    if (error) {
      return "something went wrong DELETING CART ITEMS";
    } else {
      let newCart = data.filter((element) => {
        if (element.id !== id) {
          return element;
        } else {
          element.delete();
        }
      });
      data = newCart;
      // data.forEach((element, index) => {
      //   data[index].delete();
      // });
      res.send(data);
    }
  });
}

// listening On PORT 3002
server.listen(PORT, () => {
  console.log(`Listening On PORT ${PORT}`);
});
