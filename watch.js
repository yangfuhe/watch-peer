let exec = require('child_process').exec;
let fs = require('fs')
let moment = require('moment')
let maxHeight = 0
let getMaxHeight = () => {
    return new Promise((resolve, reject) => {
        let cmdBlock = `curl -X POST --data '{"funName":"getBlock", "args":{ "which": "latest", "transactions": true}}' http://localhost:7001/rpc`;
        exec(cmdBlock, function(err, stdout, srderr) {
            if (err) {
                reject({ err: "异常" });
            } else {
                let height = JSON.parse(stdout).block.number;
                resolve(height)
            }
        });
    })
}


let watchPeer = async() => {
    let newMaxHeight = await getMaxHeight();
    console.log("peer", maxHeight, newMaxHeight)
    if (isNaN(newMaxHeight)) { return }
    if (maxHeight != newMaxHeight) {
        maxHeight = newMaxHeight
    } else {
        console.log("准备为您重启peer")
        let cmdRestartPeer = 'pm2 restart peer';
        exec(cmdRestartPeer, (err1, stdout1, srderr1) => {
            if (err1) {
                console.log(srderr1)
            } else {
                fs.appendFile('./peer-log.txt', `\n ${moment().format("YYYY-MM-DD hh:mm:ss")},已为您重启，块高${maxHeight}`, (error) => {})
                console.log("已为您重启peer")
            }
        })
    }
}

let run = async() => {
    console.log("开始监控peer")
    setInterval(() => {
        watchPeer()
    }, 1000 * 60 * 5)
}

run();