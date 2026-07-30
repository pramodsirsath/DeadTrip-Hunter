const { exec } = require("child_process");

function TrainModel() {
    exec("node ML/export_dataset.js", (err) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log("Dataset exported.");

    exec("python ML/train.py", (err) => {
        if (err) {
            console.log(err);
            return;
        }

        console.log("Model trained successfully.");
    });
});
}

module.exports = TrainModel;