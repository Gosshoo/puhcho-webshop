'use strict';

const stripe = require('stripe')('sk_test_e2RS7p7eIQg5d9owuT97mLwz00v81lfnEQ');
/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    create: async (ctx) => {
        const { address, amount, toys, postalCode, token, city } = ctx.request.body;

        // Send charge to Stripe
        const charge = await stripe.charges.create({
            amount: amount * 100,
            currency: 'dkk',
            description: `order ${new Date(Date.now())} - User ${ctx.state.user._id}`,
            source: token
        });

        // Create order in database 
        // strapi.services.orders.add
        const order = await strapi.api.orders.services.orders.create({
            user: ctx.state.user._id,
            address,
            amount,
            toys,
            postalCode,
            city
        });

        return order;
    }
};
