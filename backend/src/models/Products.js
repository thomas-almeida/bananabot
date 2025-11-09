import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    title: String,
    price: String,
    link: String,
    image: { type: String, default: null },

});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
