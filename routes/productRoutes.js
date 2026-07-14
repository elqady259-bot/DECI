const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');

router.route('/').post(controller.createProduct).get(controller.getProducts);
router
  .route('/:id')
  .get(controller.getProduct)
  .patch(controller.updateProduct)
  .delete(controller.deleteProduct);

module.exports = router;
