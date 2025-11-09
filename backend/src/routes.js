import { Router } from "express";
import { createUser, insertOrder, changePriceRange } from "./controllers/userController.js";
import { search, generateAfiliateLinks } from "./controllers/mercadoLivreController.js";

const api = Router();

api.get("/hello", (req, res) => {
    res.json({ message: "Hello World!" });
});

// User
api.post("/users/create", createUser);

//acoes do usuario no chat
api.post("/users/new-order", insertOrder);
api.put("/users/change-price-range", changePriceRange);

// Mercado Livre
// Com base em termos
api.get("/mercadolivre/search/:query/:limit/:pricerange", search);
api.get("/mercadolivre/afiliate/:query/:limit/:pricerange", generateAfiliateLinks);


export default api;
