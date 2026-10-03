const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword',
    role: 'admin',
  },
  {
    name: 'Demo Customer',
    email: 'customer@example.com',
    password: 'customerpassword',
    role: 'customer',
  },
];

const categories = [
  {
    name: 'Electronics',
    description: 'High-tech gadgets, premium audio, smart devices, and computer accessories.',
  },
  {
    name: 'Fashion',
    description: 'Modern everyday apparel, jackets, knitwear, and timeless wardrobe essentials.',
  },
  {
    name: 'Footwear',
    description: 'Performance running shoes, casual lifestyle sneakers, and handcrafted leather boots.',
  },
  {
    name: 'Home & Living',
    description: 'Minimalist interior decor, warm ambient lighting, and artisanal kitchen accessories.',
  },
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-ecom';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB Atlas...');

    // 1. Clear existing collections
    await Order.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    console.log('[Seeder] Cleared previous orders, products, categories, and users.');

    // 2. Seed Users (using User.create so pre-save bcrypt hook fires)
    const createdUsers = [];
    for (const u of users) {
      const userDoc = await User.create(u);
      createdUsers.push(userDoc);
    }
    console.log(`[Seeder] Created ${createdUsers.length} users.`);

    // 3. Seed Categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`[Seeder] Created ${createdCategories.length} categories.`);

    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // 4. Seed Products
    const products = [
      {
        name: 'Wireless Noise-Canceling Headphones',
        description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear high fidelity sound.',
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        category: categoryMap['Electronics'],
        stock: 25,
      },
      {
        name: 'Smart Fitness Watch Series 7',
        description: 'Advanced smartwatch with vibrant AMOLED display, optical heart rate sensor, sleep tracking, and 50m water resistance.',
        price: 199.5,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        category: categoryMap['Electronics'],
        stock: 18,
      },
      {
        name: 'Mechanical RGB Gaming Keyboard',
        description: 'Compact mechanical keyboard with responsive tactile switches, customizable per-key backlighting, and aluminum chassis.',
        price: 89.0,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        category: categoryMap['Electronics'],
        stock: 30,
      },
      {
        name: 'Classic Vintage Denim Jacket',
        description: 'Timeless relaxed-fit denim jacket crafted from 100% durable cotton denim with antique brass buttons.',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
        category: categoryMap['Fashion'],
        stock: 15,
      },
      {
        name: 'Organic Cotton Essential Hoodie',
        description: 'Ultra-soft fleece hoodie featuring kangaroo pocket, double-layered hood, and modern athletic silhouette.',
        price: 59.0,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        category: categoryMap['Fashion'],
        stock: 40,
      },
      {
        name: 'Air Velocity Pro Running Shoes',
        description: 'High-performance athletic sneakers featuring responsive air cushioning, ergonomic support, and breathable mesh.',
        price: 129.0,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        category: categoryMap['Footwear'],
        stock: 20,
      },
      {
        name: 'Handcrafted Leather Chelsea Boots',
        description: 'Full-grain oiled leather boots with elastic side gores and rugged commando rubber outsoles for all-weather traction.',
        price: 159.99,
        image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&auto=format&fit=crop&q=80',
        category: categoryMap['Footwear'],
        stock: 12,
      },
      {
        name: 'Minimalist Ceramic Ambient Desk Lamp',
        description: 'Contemporary architectural table lamp with frosted globe diffuser and warm dimmable LED ambiance.',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
        category: categoryMap['Home & Living'],
        stock: 22,
      },
      {
        name: 'Artisan Borosilicate Pour-Over Carafe',
        description: 'Heat-resistant glass pour-over coffee dripper paired with ultra-fine stainless steel reusable filter.',
        price: 38.5,
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=800&auto=format&fit=crop&q=80',
        category: categoryMap['Home & Living'],
        stock: 35,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`[Seeder] Created ${createdProducts.length} products.`);

    console.log('----------------------------------------------------');
    console.log('✅ SEEDING COMPLETE');
    console.log('----------------------------------------------------');
    console.log('Admin User:    admin@example.com    / adminpassword');
    console.log('Customer User: customer@example.com / customerpassword');
    console.log(`Categories:    ${createdCategories.map((c) => c.name).join(', ')}`);
    console.log(`Products:      ${createdProducts.length} items loaded`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-ecom';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB Atlas...');

    await Order.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    console.log('[Seeder] All database records deleted successfully!');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}
