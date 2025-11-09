import User from "../models/User.js";

export const createUser = async (req, res) => {
    try {
        const { phoneNumber, categories, priceRange } = req.body;


        const existingUser = await User.findOne({ phoneNumber });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Este número de telefone já está em uso.'
            });
        }

        const newUser = new User({
            phoneNumber,
            priceRange,
            preferences: {
                categories: categories || []
            }
        });

        newUser.save();

        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso!',
            data: newUser
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar a requisição',
            error: error.message
        });
    }
};