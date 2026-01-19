
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-safety';

async function run() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        // Use a generic schema since we just want to see raw data
        const reportSchema = new mongoose.Schema({ campusId: mongoose.Schema.Types.ObjectId }, { strict: false });
        const Report = mongoose.model('Report', reportSchema, 'reports');

        const allReports = await Report.find();
        console.log(`Total reports in DB: ${allReports.length}`);

        let withoutCampus = 0;
        allReports.forEach(r => {
            if (!r.campusId) withoutCampus++;
        });

        console.log(`Reports without campusId: ${withoutCampus}`);
        console.log(`Reports with campusId: ${allReports.length - withoutCampus}`);

        if (allReports.length > 0) {
            console.log('First report sample:', JSON.stringify(allReports[0].location, null, 2));
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
