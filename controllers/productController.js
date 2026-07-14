const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.createProduct = asyncHandler(async (req, res) => {
  const { category } = req.body;
  
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) throw new ApiError('Category not found', 404);
  }
  
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, search, inStock, sort, fields, page, limit } = req.query;

  const filter = {};

  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (inStock === 'true') {
    filter.stock = { $gt: 0 };
  }

  let query = Product.find(filter);

  if (sort) {
    const sortBy = sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  if (fields) {
    const select = fields.split(',').join(' ');
    query = query.select(select);
  }

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 25;
  const skip = (pageNum - 1) * limitNum;
  query = query.skip(skip).limit(limitNum);

  const products = await query.populate('category', 'name description');
  const total = await Product.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: products,
  });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name description');
  if (!product) throw new ApiError('Product not found', 404);
  res.status(200).json({ success: true, data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const { category } = req.body;
  
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) throw new ApiError('Category not found', 404);
  }
  
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError('Product not found', 404);
  res.status(200).json({ success: true, data: product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError('Product not found', 404);
  res.status(200).json({ success: true, data: {} });
});
