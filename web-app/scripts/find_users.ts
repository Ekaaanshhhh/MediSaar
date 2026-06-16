import mongoose from 'mongoose';
import { User } from '../models/User';
import connectToDatabase from '../lib/mongodb';

async function main() {
  await connectToDatabase();
  const users = await User.find({
    name: { $regex: 'devang', $options: 'i' }
  }).select('name email role').lean();
  
  console.log("Devang users:");
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

main().catch(console.error);
