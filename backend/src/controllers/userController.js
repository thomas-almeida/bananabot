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


export const insertOrder = async (req, res) => {
    try {
        const { phoneNumber, order } = req.body;

        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        user.preferences.orders.push(order);

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso!',
            data: user
        });
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar a requisição',
            error: error.message
        });
    }
}

export const changePriceRange = async (req, res) => {
    try {
        const { phoneNumber, priceRange } = req.body
        const user = await User.findOne({ phoneNumber })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        user.priceRange = priceRange;

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Faixa de preço alterada com sucesso!',
            data: user
        });
    } catch (error) {
        console.error('Erro ao alterar faixa de preço:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar a requisição',
            error: error.message
        });
    }
}