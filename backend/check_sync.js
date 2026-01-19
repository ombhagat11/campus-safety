
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-safety';

async function run() {
    try {
        await mongoose.connect(mongoUri);

        const User = mongoose.model('User', new mongoose.Schema({ email: String, campusId: mongoose.Schema.Types.ObjectId }, { strict: false }));
        const Report = mongoose.model('Report', new mongoose.Schema({ title: String, campusId: mongoose.Schema.Types.ObjectId }, { strict: false }));
        const Campus = mongoose.model('Campus', new mongoose.Schema({ name: String }, { strict: false }));

        const users = await User.find();
        console.log('--- USERS ---');
        for (const u of users) {
            console.log(`User: ${u.email}, CampusId: ${u.campusId}`);
        }

        const reports = await Report.find();
        console.log('\n--- REPORTS ---');
        const reportCampusIds = [...new Set(reports.map(r => r.campusId?.toString()))];
        console.log(`Unique Report CampusIds: ${reportCampusIds.join(', ')}`);
        console.log(`Total Reports: ${reports.length}`);

        const campuses = await Campus.find();
        console.log('\n--- CAMPUSES ---');
        for (const c of campuses) {
            console.log(`Campus: ${c.name}, ID: ${c._id}`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
