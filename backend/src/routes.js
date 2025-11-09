import { Router } from "express";
import { createUser } from "./controllers/userController.js";

const api = Router();

api.get("/hello", (req, res) => {
    res.json({ message: "Hello World!" });
});

// User
api.post("/users/create", createUser);

export default api;
