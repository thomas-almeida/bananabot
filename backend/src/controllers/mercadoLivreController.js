import { searchProducts, generateMercadolivreLinks } from "../services/mercadolivre/mercadolivre-generate.js";

export async function search(req, res) {
    try {
        const { query, limit, pricerange } = req.params;
        const products = await searchProducts(query, limit, pricerange);
        res.json(products);
        return products
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

function createPromotionalMessage(product, affiliateLink) {
    // Format the price with proper currency
    const price = product.price.includes(',')
        ? `R$ ${product.price}`
        : `R$ ${product.price},00`;

    // Return message parts as an array that can be joined with newlines

    return `🚀 *${product.title}*
    💵 *Por apenas ${price}*!
    🔥 Corre que é oferta especial por tempo limitado!
    🛍️ Garanta já o seu!
    🔗 ${affiliateLink}`;
}

export async function generateAfiliateLinks(req, res) {
    try {
        const { query, limit, pricerange } = req.params;
        const products = await searchProducts(query, limit, pricerange);
        const linksToAfiliate = products.map(prod => prod.link);

        console.log('Original product links:', linksToAfiliate);

        const afiliateLinks = await generateMercadolivreLinks(linksToAfiliate);

        // Process the response to ensure we have a clean array of links
        let formattedLinks = [];
        if (afiliateLinks && afiliateLinks.length > 0) {
            // Split the string by newlines and filter out any empty strings
            formattedLinks = afiliateLinks[0].split('\n').filter(link => link.trim() !== '');
        }

        // Create promotional messages for each product with its affiliate link
        const promotionalMessages = products.map((product, index) => ({
            title: product.title,
            price: product.price,
            link: formattedLinks[index] || '',
            whatsappMessage: formattedLinks[index]
                ? createPromotionalMessage(product, formattedLinks[index])
                : `Produto indisponível: ${product.title}`,
            originalLink: product.link
        }));


        let validProducts = promotionalMessages.filter(prod => prod.link.startsWith('https://mercadolivre.com/sec/'));

        res.json({
            success: true,
            count: validProducts.length,
            messages: validProducts
        });

        console.log(`Produtos Criados: +${validProducts.length}`);

        return ({
            success: true,
            count: validProducts.length,
            messages: validProducts
        })

    } catch (error) {
        console.error('Error generating affiliate links:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}