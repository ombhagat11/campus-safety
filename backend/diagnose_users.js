
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-safety';

async function run() {
    try {
        await mongoose.connect(mongoUri);

        const userSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.model('User', userSchema, 'users');

        const campusSchema = new mongoose.Schema({}, { strict: false });
        const Campus = mongoose.model('Campus', campusSchema, 'campuses');

        const users = await User.find();
        for (const u of users) {
            const userCampus = u.campusId ? await Campus.findById(u.campusId) : null;
            console.log(`User: ${u.email}, Role: ${u.role}, Campus: ${userCampus ? userCampus.name : 'NONE'} (${u.campusId})`);
        }

        process.exit();
    } catch (err) {
        process.exit(1);
    }
}

run();
