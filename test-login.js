const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        const url = 'mongodb://127.0.0.1:27018';
        const client = new MongoClient(url);
        await client.connect();
        const db = client.db('construction_manager');
        const user = await db.collection('users').findOne({username: 'admin'});
        
        console.log('User found:', user ? 'Yes' : 'No');
        
        if (user) {
            console.log('User details:', { ...user, password: '[REDACTED]' });
            const isMatch = await bcrypt.compare('admin123', user.password);
            console.log('Password Match for admin123:', isMatch);
        } else {
            console.log('Admin user does not exist in the database.');
        }

        await client.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

run();
