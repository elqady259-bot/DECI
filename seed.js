require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');

const seed = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    await Category.deleteMany();
    console.log('Data destroyed...');

    const categories = await Category.create([
      { name: 'Electronics', description: 'Laptops, phones, and gadgets' },
      { name: 'Accessories', description: 'Bags, chargers, and peripherals' },
      { name: 'Gaming', description: 'Consoles and gaming gear' },
    ]);

    const [electronics, accessories, gaming] = categories;

    const products = [
      { name: 'MacBook Pro 16', price: 45000, stock: 10, category: electronics._id, description: 'Apple laptop with M3 chip' },
      { name: 'Dell XPS 13', price: 32000, stock: 15, category: electronics._id, description: 'Ultra-thin Windows laptop' },
      { name: 'HP Pavilion 15', price: 18000, stock: 20, category: electronics._id, description: 'Budget-friendly laptop' },
      { name: 'Lenovo ThinkPad X1', price: 38000, stock: 8, category: electronics._id, description: 'Business-class laptop' },
      { name: 'USB-C Charger', price: 350, stock: 100, category: accessories._id, description: 'Fast charging adapter' },
      { name: 'Laptop Sleeve 15', price: 250, stock: 50, category: accessories._id, description: 'Protective case' },
      { name: 'Wireless Mouse', price: 450, stock: 80, category: accessories._id, description: 'Bluetooth mouse' },
      { name: 'PlayStation 5', price: 28000, stock: 12, category: gaming._id, description: 'Sony gaming console' },
      { name: 'Xbox Controller', price: 1800, stock: 40, category: gaming._id, description: 'Wireless gamepad' },
      { name: 'Gaming Headset', price: 1200, stock: 30, category: gaming._id, description: 'Surround sound headset' },
    ];

    await Product.insertMany(products);
    console.log('Data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    process.exit(1);
  }
};

seed();
