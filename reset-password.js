const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        const url = 'mongodb://127.0.0.1:27018';
        const client = new MongoClient(url);
        await client.connect();
        const db = client.db('construction_manager');
        const users = db.collection('users');
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const result = await users.updateOne(
            { username: 'admin' },
            { $set: { password: hashedPassword } }
        );
        
        console.log('Password updated:', result.modifiedCount > 0);

        await client.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

run();
