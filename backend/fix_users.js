
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-safety';

async function run() {
    try {
        await mongoose.connect(mongoUri);
        const Campus = mongoose.model('Campus', new mongoose.Schema({ name: String }, { strict: false }));
        const User = mongoose.model('User', new mongoose.Schema({ campusId: mongoose.Schema.Types.ObjectId }, { strict: false }));

        const firstCampus = await Campus.findOne();
        if (!firstCampus) {
            console.log('No campuses found');
            process.exit();
        }

        console.log(`Found campus: ${firstCampus.name} (${firstCampus._id})`);

        const result = await User.updateMany({ campusId: { $exists: false } }, { $set: { campusId: firstCampus._id } });
        console.log(`Updated ${result.modifiedCount} users with campusId: ${firstCampus._id}`);

        process.exit();
    } catch (err) {
        process.exit(1);
    }
}
run();
