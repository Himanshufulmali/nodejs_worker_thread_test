const express = require("express");
const {Worker} = require("worker_threads");
const app = express();
const threadCount = 2;

app.get("/non-blocking",(req,res) => {
    res.status(200).send("This is non blocking so response will be quick");
});

// code for two worker as i have two cores
function createWorker(){
    return new Promise((resolve, reject) => {
        const worker = new Worker("./two-workers.js", {
        workerData : { threadCount : threadCount }
        });
        
        worker.on("message", (data) =>{
        resolve(data);
        });

    });
}

// now we will use one thread for blocking and other for non-blocking api, comment createWorker() and line 34 api if you use this api
// app.get("/blocking", async(req,res) => {
//     const worker = new Worker("./worker.js");

//     worker.on("message", (data) =>{
//         res.status(200).send(`result is ${data}`);
//     });
// });

// here we are using 2 threads for performing calsulation faster
app.get("/blocking", async(req,res) => {
    const workerPromise = [];

    for(let i =0; i< threadCount; i++){
        workerPromise.push(createWorker());
    }

    const threadResult = await Promise.all(workerPromise);
    const total = threadResult[0] + threadResult[1];
    res.status(200).send(`result is ${total}`)
});

app.listen(3000, () => {
    console.log("server started on port : "+ 3000);
    
})