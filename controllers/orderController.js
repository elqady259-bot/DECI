const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const getUserId = (req) => {
  const userId = req.header('x-user-id') || req.body.userId;
  if (!userId) throw new ApiError('x-user-id header is required', 400);
  return userId;
};

exports.createOrder = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { shippingAddress } = req.body;

  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new ApiError('Cart is empty', 400);
  }

  const orderItems = [];
  let totalPrice = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id || item.product);
    if (!product) throw new ApiError('Product not found', 404);
    if (product.stock < item.quantity) {
      throw new ApiError(
        `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        400
      );
    }

    const unitPrice = product.price;
    const lineTotal = unitPrice * item.quantity;
    totalPrice += lineTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      price: unitPrice,
      quantity: item.quantity,
    });

    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    user: userId,
    items: orderItems,
    totalPrice,
    status: 'pending',
    shippingAddress: shippingAddress || {},
  });

  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(201).json({ success: true, data: order });
});

exports.getOrders = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const orders = await Order.find({ user: userId }).sort('-createdAt');
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const order = await Order.findOne({ _id: req.params.id, user: userId });
  if (!order) throw new ApiError('Order not found', 404);
  res.status(200).json({ success: true, data: order });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status) throw new ApiError('Status is required', 400);
  
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(
      `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      400
    );
  }
  
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!order) throw new ApiError('Order not found', 404);
  res.status(200).json({ success: true, data: order });
});
