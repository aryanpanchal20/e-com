const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

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
    description: 'Smartphones, laptops, headphones, and cutting-edge tech gadgets',
  },
  {
    name: 'Fashion',
    description: 'Trendy clothing, apparel, jackets, and stylish accessories',
  },
  {
    name: 'Shoes',
    description: 'Athletic sneakers, running footwear, casual shoes, and boots',
  },
  {
    name: 'Home & Living',
    description: 'Modern home decor, lighting, living room accents, and lifestyle essentials',
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-ecom');
    console.log('[Seeder] Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('[Seeder] Cleared existing users, categories, and products.');

    // Seed Users
    const createdUsers = [];
    for (const u of users) {
      const createdUser = await User.create(u);
      createdUsers.push(createdUser);
    }
    console.log(`[Seeder] Seeded ${createdUsers.length} users.`);

    // Seed Categories
    const categoryMap = {};
    for (const cat of categories) {
      const createdCat = await Category.create(cat);
      categoryMap[createdCat.name] = createdCat._id;
    }
    console.log(`[Seeder] Seeded ${Object.keys(categoryMap).length} categories.`);

    // Sample Products
    const sampleProducts = [
      {
        name: 'Pro Smartphone X',
        description: '128GB Storage, AMOLED Display, 5G Ready with triple-lens camera',
        price: 699.99,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60',
        category: categoryMap['Electronics'],
        stock: 15,
      },
      {
        name: 'Wireless Noise-Canceling Headphones',
        description: 'Over-ear Bluetooth headphones with high-fidelity audio and 40h battery life',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
        category: categoryMap['Electronics'],
        stock: 25,
      },
      {
        name: 'Classic Denim Jacket',
        description: 'Timeless vintage denim jacket with durable stitching and comfortable regular fit',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=60',
        category: categoryMap['Fashion'],
        stock: 30,
      },
      {
        name: 'Organic Cotton Crewneck T-Shirt',
        description: 'Ultra-soft breathable 100% organic cotton daily crewneck tee',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=60',
        category: categoryMap['Fashion'],
        stock: 50,
      },
      {
        name: 'Ultra-Light Running Shoes',
        description: 'Engineered mesh upper with responsive foam cushioning for road and track runners',
        price: 119.99,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60',
        category: categoryMap['Shoes'],
        stock: 20,
      },
      {
        name: 'Leather Casual Sneakers',
        description: 'Minimalist low-top genuine leather sneakers for everyday street style',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=60',
        category: categoryMap['Shoes'],
        stock: 18,
      },
      {
        name: 'Minimalist Ceramic Desk Lamp',
        description: 'Warm ambient lighting with dimmer touch control and matte ceramic finish',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=60',
        category: categoryMap['Home & Living'],
        stock: 12,
      },
      {
        name: 'Aroma Essential Oil Diffuser',
        description: 'Ultrasonic cool mist aromatherapy diffuser with subtle multi-color LED night light',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=60',
        category: categoryMap['Home & Living'],
        stock: 40,
      },
    ];

    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`[Seeder] Seeded ${createdProducts.length} sample products with stock.`);

    console.log('----------------------------------------------------');
    console.log('Database Seeding Completed Successfully!');
    console.log('Admin Account:    admin@example.com    / adminpassword');
    console.log('Customer Account: customer@example.com / customerpassword');
    console.log(`Categories:       ${categories.map((c) => c.name).join(', ')}`);
    console.log(`Sample Products:  ${createdProducts.length} items with inventory stock`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-ecom');
    console.log('[Seeder] Connected to MongoDB...');

    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('[Seeder] All users, categories, and products destroyed successfully!');

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
