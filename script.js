const events = require('events');
const fs = require('fs');
const readline = require('readline');

const { getBlames } = require('./blameScript.js')

const formatTextToCsv = (dataToWrite) => dataToWrite.map( x => {
        const splitData = x.line.split('/')
        const fileName = splitData.slice(splitData.length - 1)
        const path = splitData.slice(4).join('/')
        const blames = Object.values(x.namesWithBlames).map(x => String(x)).join(', ')

        return { fileName, path, blames }
    })

const readText = async (type) => new Promise(async (res, rej) => {
    try {
        const file = `./temps/V${type}.txt`
        const files = []
        var lines = 0
        const rl = readline.createInterface({
            input: fs.createReadStream(file),
            crlfDelay: Infinity
        })
        
        console.log('----------------------------------------------------------------------------');
        console.log(`Start reading for V${type} controllers...`)
        
        rl.on('line', async (line) => {
            lines++
            const namesWithBlames = await getBlames(line.split('/').slice(5).join('/'))
            files.push({ line, namesWithBlames })
        });
        
        await events.once(rl, 'close');
        
        const formatted = formatTextToCsv(files)
        const decision = formatted.length == lines ? `All ${lines} lines read correctly!` : 'lines Read incorrectly'
        
        console.log(`Reading file V${type} controllers done.`);
        console.log(decision)
        
        rl.close()
        res(formatted)
    }
    catch (err) {
        rej()
        console.error(err);
    }
})

function writeCsv(dataToWrite, type) {
    console.log(`Start writing for V${type} controllers...`)
    const ws = fs.createWriteStream(`./results/V${type}.csv`, { flags: 'w' });
    
    return new Promise((res, rej) => {
        (function writeToFile(i) {
            for (; i < dataToWrite.length; i++) {
                const header = { fileName: 'FILE NAME', path: 'FILE PATH', blames: 'Ahzam, Matt, Colby' }
                const { fileName, path, blames } = i == 0 ? header : dataToWrite[i]
                if (!ws.write(`${fileName}, ${path}, ${blames}\n`)) {
                    // Wait for buffer drain then start writing again
                    ws.once('drain', () => {
                        writeToFile(i + 1);
                    });
                    return;
                }
            }
            console.log(`Results populated for V${type} controllers!`);
            ws.end();
            res()
        })(0)
    })
}

(async function start() {
    for(var i = 1; i < 4; i++) {
        await writeCsv(await readText(i), i)
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
    }
})()