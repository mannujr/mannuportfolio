#!/usr/bin/env node
/**
 * Simple script to create or upgrade an admin user.
 * Usage: node scripts/create-admin.js email password
 * Reads MONGODB_URI from .env.local using dotenv.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)\s*$/);
    if (m) {
      const key = m[1];
      let val = m[2] || '';
      // remove surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment or .env.local');
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/create-admin.js email password');
    process.exit(1);
  }
  const [email, password] = args;

  if (process.env.NODE_ENV === 'production') {
    console.error('This script should not be run in production');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    name: { type: String }
  }, { timestamps: true });

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = 'admin';
      if (password) {
        const hashed = await bcrypt.hash(password, 12);
        existing.password = hashed;
      }
      await existing.save();
      console.log('Upgraded existing user to admin:', email);
    } else {
      const hashed = await bcrypt.hash(password, 12);
      const user = await User.create({ email, password: hashed, role: 'admin', name: email.split('@')[0] });
      console.log('Created admin user:', user.email);
    }
  } catch (err) {
    console.error('Error creating/updating admin user:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
