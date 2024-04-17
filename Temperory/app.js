const express = require('express');
const app = express();

const { spawn } = require('child_process');
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/execute', (req, res) => {
    const pythonProcess = spawn('python', ['temp.py']);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        res.send('Script executed successfully');
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
