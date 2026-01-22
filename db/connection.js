const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

let client = null;
let db = null;

// Default database configuration
const DEFAULT_DB_PATH = path.join(__dirname, '..', 'data');
const DB_NAME = 'construction_manager';

async function initDatabase(connectionUrl = null) {
    try {
        // NOTE: Directory creation is now handled by main.js before spawning mongod

        // MongoDB connection URL
        // If provided, use it (from main.js spawning on custom port)
        // If not, default to standard localhost:27017 (dev fallback)
        const url = connectionUrl || 'mongodb://localhost:27017';

        console.log(`Connecting to MongoDB at ${url}...`);

        client = new MongoClient(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        await client.connect();
        db = client.db(DB_NAME);

        console.log('Connected to MongoDB successfully');

        // Initialize collections if they don't exist
        await initializeCollections();

        // Create default admin user if no users exist
        await createDefaultUser();

        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);

        // Fallback to in-memory storage for development
        console.log('Using in-memory storage as fallback');
        db = createInMemoryDB();

        return db;
    }
}

async function initializeCollections() {
    const collections = ['users', 'projects', 'workers', 'materials', 'equipment', 'expenses', 'config'];

    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);

    for (const collectionName of collections) {
        if (!existingNames.includes(collectionName)) {
            await db.createCollection(collectionName);
            console.log(`Created collection: ${collectionName}`);
        }
    }
}

async function createDefaultUser() {
    const users = db.collection('users');
    const userCount = await users.countDocuments();

    if (userCount === 0) {
        await users.insertOne({
            username: 'admin',
            password: 'admin123', // In production, this should be hashed
            role: 'admin',
            createdAt: new Date()
        });
        console.log('Default admin user created (username: admin, password: admin123)');
    }
}

function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase first.');
    }
    return db;
}

async function closeDatabase() {
    if (client) {
        try {
            await client.close();
            console.log('Database connection closed');
        } catch (error) {
            console.error('Error closing database:', error);
        }
        client = null;
        db = null;
    }
}

// Fallback in-memory database for development
function createInMemoryDB() {
    const storage = {
        users: [{ _id: '1', username: 'admin', password: 'admin123', role: 'admin' }],
        projects: [],
        workers: [],
        materials: [],
        equipment: [],
        expenses: [],
        config: []
    };

    return {
        collection: (name) => ({
            find: (query = {}) => ({
                toArray: async () => {
                    return storage[name] || [];
                }
            }),
            findOne: async (query) => {
                const items = storage[name] || [];
                return items.find(item => {
                    return Object.keys(query).every(key => item[key] === query[key]);
                });
            },
            insertOne: async (doc) => {
                const id = Date.now().toString();
                const newDoc = { ...doc, _id: id };
                storage[name].push(newDoc);
                return { insertedId: id, ops: [newDoc] };
            },
            updateOne: async (query, update) => {
                const items = storage[name] || [];
                const index = items.findIndex(item => {
                    return Object.keys(query).every(key => item[key] === query[key]);
                });
                if (index !== -1) {
                    if (update.$set) {
                        storage[name][index] = { ...items[index], ...update.$set };
                    }
                    return { modifiedCount: 1 };
                }
                return { modifiedCount: 0 };
            },
            deleteOne: async (query) => {
                const items = storage[name] || [];
                const index = items.findIndex(item => {
                    return Object.keys(query).every(key => item[key] === query[key]);
                });
                if (index !== -1) {
                    storage[name].splice(index, 1);
                    return { deletedCount: 1 };
                }
                return { deletedCount: 0 };
            },
            countDocuments: async () => {
                return (storage[name] || []).length;
            }
        })
    };
}

module.exports = {
    initDatabase,
    getDatabase,
    closeDatabase
};
