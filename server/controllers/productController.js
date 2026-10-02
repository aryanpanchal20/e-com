const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products with filtering (category, search keyword)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    // Category filter: support category ObjectId or category name
    if (category) {
      let matchedCategoryId = null;

      if (mongoose.Types.ObjectId.isValid(category)) {
        const catById = await Category.findById(category);
        if (catById) {
          matchedCategoryId = catById._id;
        }
      }

      if (!matchedCategoryId) {
        // Look up by category name (case-insensitive)
        const catByName = await Category.findOne({
          name: { $regex: new RegExp(`^${category.trim()}$`, 'i') },
        });
        if (catByName) {
          matchedCategoryId = catByName._id;
        }
      }

      if (matchedCategoryId) {
        filter.category = matchedCategoryId;
      } else {
        // If specified category doesn't exist, return empty results
        return res.status(200).json({
          success: true,
          count: 0,
          products: [],
        });
      }
    }

    // Keyword search: match against product name or description
    if (search && search.trim()) {
      const keyword = search.trim();
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Admin only)
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    // Field validations
    if (!name || !description || price === undefined || !image || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, image, and category',
      });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid number greater than or equal to 0.01',
      });
    }

    let numericStock = 0;
    if (stock !== undefined) {
      numericStock = Number(stock);
      if (isNaN(numericStock) || numericStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock must be a non-negative number',
        });
      }
    }

    // Verify category exists (by ObjectId or name)
    let categoryDoc = null;
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryDoc = await Category.findById(category);
    }
    if (!categoryDoc) {
      categoryDoc = await Category.findOne({
        name: { $regex: new RegExp(`^${category.trim()}$`, 'i') },
      });
    }

    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category: specified category does not exist',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      image: image.trim(),
      category: categoryDoc._id,
      stock: numericStock,
    });

    const populatedProduct = await Product.findById(product._id).populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: populatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
const updateProduct = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const { name, description, price, image, category, stock } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Product name cannot be empty',
        });
      }
      product.name = name.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Product description cannot be empty',
        });
      }
      product.description = description.trim();
    }

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice < 0.01) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid number greater than or equal to 0.01',
        });
      }
      product.price = numericPrice;
    }

    if (image !== undefined) {
      if (!image.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Product image cannot be empty',
        });
      }
      product.image = image.trim();
    }

    if (stock !== undefined) {
      const numericStock = Number(stock);
      if (isNaN(numericStock) || numericStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock must be a non-negative number',
        });
      }
      product.stock = numericStock;
    }

    if (category !== undefined) {
      let categoryDoc = null;
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryDoc = await Category.findById(category);
      }
      if (!categoryDoc) {
        categoryDoc = await Category.findOne({
          name: { $regex: new RegExp(`^${category.trim()}$`, 'i') },
        });
      }

      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category: specified category does not exist',
        });
      }

      product.category = categoryDoc._id;
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate('category', 'name');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
const deleteProduct = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
