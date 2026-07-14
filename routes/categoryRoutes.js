const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoryController');

router.route('/').post(controller.createCategory).get(controller.getCategories);
router
  .route('/:id')
  .get(controller.getCategory)
  .patch(controller.updateCategory)
  .delete(controller.deleteCategory);

module.exports = router;
