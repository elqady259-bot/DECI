const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');

router.route('/').post(controller.createOrder).get(controller.getOrders);
router.route('/:id').get(controller.getOrder);
router.route('/:id/status').put(controller.updateOrderStatus);

module.exports = router;
