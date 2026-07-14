require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User');

const seed = async () => {
  try {
    await connectDB();

    // Delete in the correct order: Orders first, then Products, then Categories, then Users
    await Order.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    // Create test users
    const users = await User.create([
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' },
      { name: 'Bob Wilson', email: 'bob@example.com' },
    ]);

    const [user1, user2, user3] = users;

    const categories = await Category.create([
      { name: 'Electronics', description: 'Laptops, phones, and gadgets' },
      { name: 'Accessories', description: 'Bags, chargers, and peripherals' },
      { name: 'Gaming', description: 'Consoles and gaming gear' },
    ]);

    const [electronics, accessories, gaming] = categories;

    const products = [
      {
        name: 'MacBook Pro 16',
        price: 45000,
        stock: 10,
        category: electronics._id,
        description: 'Powerful Apple laptop with M3 Pro chip, 16GB RAM, 512GB SSD',
      },
      {
        name: 'Dell XPS 13',
        price: 32000,
        stock: 15,
        category: electronics._id,
        description: 'Ultra-thin premium Windows laptop with Intel Core i7 processor',
      },
      {
        name: 'HP Pavilion 15',
        price: 18000,
        stock: 20,
        category: electronics._id,
        description: 'Budget-friendly laptop perfect for everyday computing tasks',
      },
      {
        name: 'Lenovo ThinkPad X1',
        price: 38000,
        stock: 8,
        category: electronics._id,
        description: 'Business-class laptop with excellent keyboard and security features',
      },
      {
        name: 'iPhone 15 Pro',
        price: 55000,
        stock: 12,
        category: electronics._id,
        description: 'Latest iPhone with A17 Pro chip and advanced camera system',
      },
      {
        name: 'Samsung Galaxy S24',
        price: 50000,
        stock: 10,
        category: electronics._id,
        description: 'Flagship Android smartphone with stunning display and AI features',
      },
      {
        name: 'USB-C Charger',
        price: 350,
        stock: 100,
        category: accessories._id,
        description: 'Fast 65W USB-C charging adapter compatible with multiple devices',
      },
      {
        name: 'Laptop Sleeve 15',
        price: 250,
        stock: 50,
        category: accessories._id,
        description: 'Protective neoprene case for 15-inch laptops with padding',
      },
      {
        name: 'Wireless Mouse',
        price: 450,
        stock: 80,
        category: accessories._id,
        description: 'Ergonomic Bluetooth mouse with rechargeable battery',
      },
      {
        name: 'Mechanical Keyboard',
        price: 850,
        stock: 25,
        category: accessories._id,
        description: 'RGB mechanical gaming keyboard with customizable switches',
      },
      {
        name: 'PlayStation 5',
        price: 28000,
        stock: 12,
        category: gaming._id,
        description: 'Next-gen gaming console by Sony with ultra-fast SSD',
      },
      {
        name: 'Xbox Series X',
        price: 26000,
        stock: 10,
        category: gaming._id,
        description: 'Most powerful gaming console with Game Pass subscription included',
      },
      {
        name: 'Xbox Controller',
        price: 1800,
        stock: 40,
        category: gaming._id,
        description: 'Wireless gamepad for Xbox and PC with premium haptics',
      },
      {
        name: 'Gaming Headset',
        price: 1200,
        stock: 30,
        category: gaming._id,
        description: 'Surround sound headset with noise cancellation for immersive gaming',
      },
    ];

    const createdProducts = await Product.insertMany(products);

    console.log('\n✅ Database seeded successfully!');
    console.log(`� Users created: ${users.length}`);
    console.log(`📁 Categories created: ${categories.length}`);
    console.log(`📦 Products created: ${createdProducts.length}`);
    console.log('\nUsers:');
    users.forEach((user) => console.log(`  - ${user.name} (${user.email}) - ID: ${user._id}`));
    console.log('\nCategories:');
    categories.forEach((cat) => console.log(`  - ${cat.name}`));
    console.log('\nProducts:');
    createdProducts.forEach((prod) => console.log(`  - ${prod.name} ($${prod.price}`));;

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seed error: ${error.message}`);
    process.exit(1);
  }
};

seed();
