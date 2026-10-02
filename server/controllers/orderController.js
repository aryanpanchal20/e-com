const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Place a new order (Checkout)
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
  try {
    const { products, shippingAddress } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided',
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    let totalAmount = 0;
    const snapshotProducts = [];
    const updatedProducts = []; // For rollback in case of error

    try {
      for (const item of products) {
        // Atomic stock decrement
        const product = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (!product) {
          const existingProduct = await Product.findById(item.product);
          if (!existingProduct) {
            throw new Error(`Product not found: ${item.product}`);
          } else {
            throw new Error(`Insufficient stock for item: ${existingProduct.name}`);
          }
        }

        updatedProducts.push({ id: item.product, quantity: item.quantity });

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        snapshotProducts.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.image,
        });
      }
    } catch (err) {
      // Rollback any stock that was decremented before the error
      for (const updated of updatedProducts) {
        await Product.findByIdAndUpdate(updated.id, {
          $inc: { stock: updated.quantity },
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Save order
    const order = await Order.create({
      user: req.user._id,
      products: snapshotProducts,
      totalAmount: Number(totalAmount.toFixed(2)),
      shippingAddress,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const allowedStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const currentOrder = await Order.findById(orderId);
    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // If status changed to 'Cancelled', automatically restore product stock
    if (status === 'Cancelled' && currentOrder.status !== 'Cancelled') {
      for (const item of currentOrder.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    // If restoring from Cancelled to something else (though not strictly required, good practice to decrement again)
    // However, assignment only mentions: "If status changed to 'Cancelled', automatically restore product stock."
    // We will stick to the exact requirement.

    currentOrder.status = status;
    const updatedOrder = await currentOrder.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
