const express = require('express');
const router = express.Router();
const controller = require('../controllers/cartController');

router.route('/').get(controller.getCart).delete(controller.clearCart);
router.route('/items').post(controller.addToCart);
router.route('/items/:productId').patch(controller.updateCartItem).delete(controller.removeItem);

module.exports = router;
