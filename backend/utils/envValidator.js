import dotenv from 'dotenv';
import path from 'path';

// Ensure env variables are loaded
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const REQUIRED_ENV = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'GROQ_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_INDEX_NAME'
];

export function validateEnv() {
  const missing = [];
  
  for (const key of REQUIRED_ENV) {
    if (!process.env[key] || process.env[key].includes('placeholder') || process.env[key].includes('temp_key')) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('====================================================');
    console.error('CRITICAL ERROR: Missing or placeholder environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('Please configure your .env file at the project root.');
    console.error('====================================================');
    
    // In test/development we can continue with a warning, but in production we exit.
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('WARNING: Running in development mode with mock/placeholder settings. Some features may fail.');
    }
  } else {
    console.log('✔ Environment variables validated successfully.');
  }
}
