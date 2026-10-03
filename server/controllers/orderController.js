const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Place a new order (Checkout with Cash on Delivery)
// @route   POST /api/orders
// @access  Private (Customer / Authenticated user)
const createOrder = async (req, res, next) => {
  try {
    const { products: orderItems, shippingAddress } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete shipping address details (name, phone, address, city, pincode)',
      });
    }

    // Process items, verify stock, and snapshot live product information
    const snapshottedProducts = [];
    const decrementedProducts = [];
    let calculatedTotal = 0;

    for (const item of orderItems) {
      const quantity = Number(item.quantity);
      if (!quantity || quantity < 1) {
        // Rollback any stock decremented so far
        for (const dec of decrementedProducts) {
          await Product.findByIdAndUpdate(dec.productId, { $inc: { stock: dec.quantity } });
        }
        return res.status(400).json({
          success: false,
          message: 'Invalid item quantity specified',
        });
      }

      // Atomically decrement stock if available
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        // Find if product even exists to give clearer message
        const prod = await Product.findById(item.product);
        // Rollback previous decrements
        for (const dec of decrementedProducts) {
          await Product.findByIdAndUpdate(dec.productId, { $inc: { stock: dec.quantity } });
        }

        const nameStr = prod ? `"${prod.name}"` : 'Selected product';
        const stockLeft = prod ? prod.stock : 0;
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${nameStr}. Available stock: ${stockLeft}`,
        });
      }

      decrementedProducts.push({ productId: item.product, quantity });

      const itemTotal = updatedProduct.price * quantity;
      calculatedTotal += itemTotal;

      snapshottedProducts.push({
        product: updatedProduct._id,
        name: updatedProduct.name,
        price: updatedProduct.price,
        quantity,
        image: updatedProduct.image,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      products: snapshottedProducts,
      totalAmount: Math.round(calculatedTotal * 100) / 100,
      shippingAddress: {
        name: shippingAddress.name.trim(),
        phone: shippingAddress.phone.trim(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
      status: 'Pending',
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

// @desc    Get logged in user's order history
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

// @desc    Get all orders across store
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrdersAdmin = async (req, res, next) => {
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
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // If order is newly cancelled, restock inventory
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = status;
    const updatedOrder = await order.save();

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
  getAllOrdersAdmin,
  updateOrderStatus,
};
