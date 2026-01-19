const mongoose = require('mongoose');
const reportSchema = new mongoose.Schema({
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    title: String,
    status: String
});
const Report = mongoose.model('Report', reportSchema);

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/campus-safety');
        const reports = await Report.find();
        console.log('Total reports:', reports.length);
        reports.forEach(r => {
            console.log(`- ${r.title} (${r.status}): ${r.location.coordinates}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
