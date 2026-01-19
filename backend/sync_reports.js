
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-safety';

async function run() {
    try {
        await mongoose.connect(mongoUri);

        const User = mongoose.model('User', new mongoose.Schema({ email: String, campusId: mongoose.Schema.Types.ObjectId }));
        const Report = mongoose.model('Report', new mongoose.Schema({ campusId: mongoose.Schema.Types.ObjectId }));
        const Campus = mongoose.model('Campus', new mongoose.Schema({ name: String }));

        const user = await User.findOne({ email: 'electrobytz@gmail.com' });
        const userCampusId = user?.campusId?.toString();

        const reports = await Report.find();
        const reportCampusIds = [...new Set(reports.map(r => r.campusId?.toString()))];

        console.log(`User Campus ID: ${userCampusId}`);
        console.log(`Report Campus IDs in DB: ${reportCampusIds.join(', ')}`);

        const mismatch = reports.filter(r => r.campusId?.toString() !== userCampusId);
        console.log(`Reports NOT matching user campus: ${mismatch.length}`);

        if (mismatch.length > 0 && userCampusId) {
            console.log('Fixing reports to match user campus...');
            await Report.updateMany({}, { $set: { campusId: user.campusId } });
            console.log('Fixed all reports.');
        }

        process.exit();
    } catch (err) {
        process.exit(1);
    }
}
run();
