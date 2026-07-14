const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const getUserId = (req) => {
  const userId = req.header('x-user-id') || req.body.userId;
  if (!userId) throw new ApiError('x-user-id header is required', 400);
  return userId;
};

exports.getCart = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name price stock description',
  });
  
  if (!cart) {
    cart = { user: userId, items: [], totalPrice: 0 };
  }
  
  res.status(200).json({ success: true, data: cart });
});

exports.addToCart = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { productId, quantity = 1 } = req.body;

  if (!productId) throw new ApiError('Product ID is required', 400);
  if (quantity < 1) throw new ApiError('Quantity must be at least 1', 400);

  const product = await Product.findById(productId);
  if (!product) throw new ApiError('Product not found', 404);
  if (product.stock < quantity) throw new ApiError(`Insufficient stock. Available: ${product.stock}`, 400);

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{ product: productId, quantity, price: product.price }],
      totalPrice: product.price * quantity,
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new ApiError(`Insufficient stock. Available: ${product.stock}`, 400);
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }
    
    cart.calculateTotal();
    await cart.save();
  }

  await cart.populate({
    path: 'items.product',
    select: 'name price stock description',
  });

  res.status(201).json({ success: true, data: cart });
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { quantity } = req.body;
  
  if (quantity === undefined || quantity === null) throw new ApiError('Quantity is required', 400);

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError('Cart not found', 404);

  const item = cart.items.find(
    (i) => i.product.toString() === req.params.productId
  );
  if (!item) throw new ApiError('Item not found in cart', 404);

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== req.params.productId
    );
  } else {
    const product = await Product.findById(req.params.productId);
    if (!product) throw new ApiError('Product not found', 404);
    
    if (product.stock < quantity) {
      throw new ApiError(`Insufficient stock. Available: ${product.stock}`, 400);
    }

    item.quantity = quantity;
    item.price = product.price;
  }
  
  cart.calculateTotal();
  await cart.save();
  
  await cart.populate({
    path: 'items.product',
    select: 'name price stock description',
  });

  res.status(200).json({ success: true, data: cart });
});

exports.removeItem = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError('Cart not found', 404);

  cart.items = cart.items.filter(
    (i) => i.product.toString() !== req.params.productId
  );
  
  cart.calculateTotal();
  await cart.save();
  
  await cart.populate({
    path: 'items.product',
    select: 'name price stock description',
  });

  res.status(200).json({ success: true, data: cart });
});

exports.clearCart = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  let cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalPrice: 0 });
  } else {
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
  }

  res.status(200).json({ success: true, data: cart });
});
