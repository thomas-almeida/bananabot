import { searchProducts } from "../services/mercadolivre/mercadolivre-generate.js";

export async function search(req, res) {
    try {
        const { query, limit } = req.query;
        const products = await searchProducts(query, limit);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

