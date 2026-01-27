const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, 'data.json');

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], resources: [] }, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

const db = {
    users: {
        find: () => readDB().users,
        findOne: (query) => {
            const users = readDB().users;
            return users.find(u => Object.keys(query).every(k => u[k] === query[k]));
        },
        create: (data) => {
            const db_data = readDB();
            const newUser = { _id: crypto.randomUUID(), ...data, createdAt: new Date() };
            db_data.users.push(newUser);
            writeDB(db_data);
            return newUser;
        }
    },
    resources: {
        find: () => ({ sort: () => readDB().resources.reverse() }), // Mock sort
        findById: (id) => readDB().resources.find(r => r._id === id),
        create: (data) => {
            const db_data = readDB();
            const newRes = { _id: crypto.randomUUID(), ...data, createdAt: new Date() };
            db_data.resources.push(newRes);
            writeDB(db_data);
            return newRes;
        }
    }
};

module.exports = db;
