const { execFile } = require("child_process");
const path = require("path");
const pythonExecutable = process.env.PYTHON || "/opt/venv/bin/python";

function predictProfit(features) {
    return new Promise((resolve, reject) => {

        execFile(
            pythonExecutable,
            [
                path.join(__dirname, "../ML/predict.py"),
                JSON.stringify(features)
            ],
            (err, stdout, stderr) => {

                if (err) return reject(err);

                if (stderr) console.log(stderr);

                const prediction = Number(stdout.trim());

                if (!Number.isFinite(prediction)) {
                    return reject(new Error("Invalid profit prediction output"));
                }

                resolve(prediction);
            }
        );

    });
}

module.exports = predictProfit;
