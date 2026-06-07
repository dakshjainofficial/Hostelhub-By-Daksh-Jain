const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB database...");
    
    // We add a short timeout for local server selection so it falls back quickly if MongoDB is offline
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("⚠️ Local MongoDB server offline. Starting In-Memory MongoDB fallback...");
    try {
      // We use MongoDB version 4.0.28 because the download size is ~70MB compared to 767MB for version 8.x
      const mongod = await MongoMemoryServer.create({
        instance: {
          dbName: "hostelhub"
        },
        binary: {
          version: "4.4.18"
        }
      });
      const uri = mongod.getUri();
      console.log(`📡 In-Memory MongoDB started at: ${uri}`);
      
      const conn = await mongoose.connect(uri);
      console.log(`✅ Connected to In-Memory MongoDB successfully!`);
    } catch (fallbackError) {
      console.error(`❌ Failed to start In-Memory MongoDB fallback: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
// trigger restart
