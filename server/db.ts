import mongoose from 'mongoose';

const DEFAULT_MONGODB_URI =
  'mongodb+srv://DigitalHeroDB:digitalhero123@cluster0.tpiw9dd.mongodb.net/digitalheroes?appName=Cluster0';

export function getEffectiveMongoUri(): string {
  const rawUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
  // If the URI is missing the database name before "?", insert "digitalheroes"
  if (rawUri.includes('mongodb.net/?')) {
    return rawUri.replace('mongodb.net/?', 'mongodb.net/digitalheroes?');
  }
  return rawUri;
}

let isConnecting = false;

export async function connectDB(): Promise<typeof mongoose> {
  if ((mongoose.connection.readyState as number) === 1) {
    return mongoose;
  }

  if (isConnecting) {
    // Wait for in-flight connection
    await new Promise((resolve) => {
      const check = setInterval(() => {
        if ((mongoose.connection.readyState as number) === 1 || !isConnecting) {
          clearInterval(check);
          resolve(null);
        }
      }, 100);
    });
    if ((mongoose.connection.readyState as number) === 1) return mongoose;
  }

  isConnecting = true;
  const uri = getEffectiveMongoUri();
  // Mask password for safe logging
  const maskedUri = uri.replace(/:([^@]+)@/, ':****@');

  try {
    mongoose.set('strictQuery', false);
    console.log(`[MongoDB] Connecting to Atlas: ${maskedUri}...`);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    console.log(
      `[MongoDB] ✅ Successfully connected to MongoDB Atlas! (Database: "${conn.connection.name}", Host: ${conn.connection.host})`
    );

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Runtime error:', err.message || err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from Atlas. Attempting reconnect...');
    });

    isConnecting = false;
    return conn;
  } catch (error: any) {
    isConnecting = false;
    console.error('[MongoDB] ❌ Connection failed:', error.message || error);
    throw error;
  }
}

export function isDbConnected(): boolean {
  return (mongoose.connection.readyState as number) === 1;
}

export function getDatabaseStatus() {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const stateNum = mongoose.connection.readyState as number;
  return {
    state: states[stateNum] || 'unknown',
    connected: stateNum === 1,
    databaseName: mongoose.connection.name || 'digitalheroes',
    host: mongoose.connection.host || 'cluster0.tpiw9dd.mongodb.net',
    port: mongoose.connection.port,
    readyState: stateNum,
  };
}
