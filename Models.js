"use strict";

const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  original_title: String,
  overview: String,
  poster_path: String,
  vote_average: Number,
  release_date: String,
  price: Number,  
});

const cartSchema = new mongoose.Schema({
    id: Number,
    counts: Number,
    limit: Number,
    original_title: String,
    price: Number,
})

const movieModel = mongoose.model("movie", movieSchema);
const moviesCart = mongoose.model("cart", cartSchema);

let utilities = {movieModel, moviesCart}
module.exports = utilities;
