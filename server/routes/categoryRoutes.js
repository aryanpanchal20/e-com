const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getAllCategories)
  .post(protect, requireAdmin, createCategory);

router
  .route('/:id')
  .put(protect, requireAdmin, updateCategory)
  .delete(protect, requireAdmin, deleteCategory);

module.exports = router;
