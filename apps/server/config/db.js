const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    
    // Provide helpful error message for MongoDB Atlas IP issues
    if (error.name === 'MongooseServerSelectionError') {
      console.error('\n=== MONGODB ATLAS CONNECTION ERROR ===');
      console.error('Your current IP address is not whitelisted in MongoDB Atlas.');
      console.error('Please add your current IP to the Atlas IP whitelist:');
      console.error('1. Go to: https://www.mongodb.com/docs/atlas/security-whitelist/');
      console.error('2. Add your current IP address to the whitelist');
      console.error('3. Wait 2-3 minutes for changes to take effect');
      console.error('========================================\n');
    }
    
    // Don't exit the process, let the server run with limited functionality
    console.log('Server will continue running without database connection...');
  }
};

module.exports = connectDB;
