const mongoose = require("mongoose")

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("MongDB connected");
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB : ", err);
    })