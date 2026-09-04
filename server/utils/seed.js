require('dotenv').config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@shophub.com',
    password: 'admin123',
    role: 'admin',
    phone: '555-0100',
  });

  const customer = await User.create({
    name: 'Demo Customer',
    email: 'user@shophub.com',
    password: 'user123',
    role: 'user',
    phone: '555-0101',
    address: {
      street: '123 Market Street',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA',
    },
  });

  await Cart.create({ user: admin._id, items: [] });
  await Cart.create({ user: customer._id, items: [] });

  // Use create() so pre('save') slug middleware runs
  const categories = await Category.create([
    { name: 'Electronics', description: 'Gadgets, devices, and accessories' },
    { name: 'Fashion', description: 'Apparel and lifestyle wear' },
    { name: 'Home & Living', description: 'Furniture and home essentials' },
    { name: 'Sports', description: 'Fitness and outdoor gear' },
  ]);

  const [electronics, fashion, home, sports] = categories;

  await Product.insertMany([
    {
      name: 'Wireless Noise-Canceling Headphones',
      description:
        'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.',
      price: 199.99,
      compareAtPrice: 249.99,
      stock: 45,
      category: electronics._id,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      brand: 'SoundMax',
      featured: true,
      ratingsAverage: 4.7,
      ratingsCount: 128,
    },
    {
      name: 'Ultra Slim Laptop 14"',
      description:
        'Lightweight productivity laptop with 16GB RAM, 512GB SSD, and all-day battery for work and creative tasks.',
      price: 999.0,
      compareAtPrice: 1199.0,
      stock: 20,
      category: electronics._id,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      brand: 'NovaTech',
      featured: true,
      ratingsAverage: 4.5,
      ratingsCount: 86,
    },
    {
      name: 'Smart Fitness Watch',
      description:
        'Track workouts, heart rate, sleep, and notifications with a bright AMOLED display and 7-day battery.',
      price: 149.5,
      compareAtPrice: 179.0,
      stock: 60,
      category: electronics._id,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      brand: 'PulseGear',
      featured: true,
      ratingsAverage: 4.4,
      ratingsCount: 210,
    },
    {
      name: 'Classic Leather Jacket',
      description:
        'Timeless mid-weight leather jacket with a tailored fit, soft lining, and durable hardware.',
      price: 189.0,
      compareAtPrice: 220.0,
      stock: 25,
      category: fashion._id,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      brand: 'UrbanThread',
      featured: true,
      ratingsAverage: 4.6,
      ratingsCount: 54,
    },
    {
      name: 'Everyday Cotton Sneakers',
      description:
        'Breathable everyday sneakers with cushioned soles and a clean minimal design for all-day comfort.',
      price: 79.99,
      compareAtPrice: 99.99,
      stock: 80,
      category: fashion._id,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      brand: 'StrideCo',
      featured: false,
      ratingsAverage: 4.3,
      ratingsCount: 173,
    },
    {
      name: 'Minimal Desk Lamp',
      description:
        'Adjustable LED desk lamp with warm and cool lighting modes, USB charging port, and matte finish.',
      price: 49.99,
      compareAtPrice: 64.99,
      stock: 40,
      category: home._id,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
      brand: 'LumenHome',
      featured: true,
      ratingsAverage: 4.2,
      ratingsCount: 41,
    },
    {
      name: 'Ceramic Pour-Over Coffee Set',
      description:
        'Hand-finished ceramic dripper and mug set for a clean, cafe-quality pour-over experience at home.',
      price: 39.0,
      stock: 55,
      category: home._id,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
      brand: 'BrewForm',
      featured: false,
      ratingsAverage: 4.8,
      ratingsCount: 67,
    },
    {
      name: 'Performance Running Shoes',
      description:
        'Lightweight running shoes engineered for cushioning, grip, and breathability on road and trail.',
      price: 129.0,
      compareAtPrice: 150.0,
      stock: 35,
      category: sports._id,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      brand: 'ApexRun',
      featured: true,
      ratingsAverage: 4.5,
      ratingsCount: 92,
    },
    {
      name: 'Resistance Band Set',
      description:
        'Complete home workout band set with five resistance levels, door anchor, and carry bag.',
      price: 29.99,
      stock: 100,
      category: sports._id,
      image: 'https://images.unsplash.com/photo-1598289430214-2b1a0c0a0a0a?w=800',
      brand: 'FitForge',
      featured: false,
      ratingsAverage: 4.1,
      ratingsCount: 38,
    },
    {
      name: 'Insulated Water Bottle 32oz',
      description:
        'Double-wall stainless steel bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
      price: 34.5,
      stock: 70,
      category: sports._id,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
      brand: 'HydroPeak',
      featured: false,
      ratingsAverage: 4.6,
      ratingsCount: 119,
    },
  ]);

  console.log('Seed completed successfully');
  console.log('Admin:  admin@shophub.com / admin123');
  console.log('User:   user@shophub.com / user123');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
