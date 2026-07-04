const express = require('express');
const router = express.Router();
const controller = require('../controllers/cartController');

router.route('/').get(controller.getCart).post(controller.createCart).delete(controller.clearCart);
router.route('/:productId').put(controller.updateCartItem).delete(controller.removeItem);

module.exports = router;
