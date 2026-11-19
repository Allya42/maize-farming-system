const dns = require('node:dns');

// Use Cloudflare DNS for local development
if (process.env.USE_CLOUDFLARE_DNS === 'true') {
    dns.setServers(['1.1.1.1', '1.0.0.1']);
}

const mongoose = require('mongoose');


async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI is missing from environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected → ${mongoose.connection.name}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
