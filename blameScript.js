const execSync = require('child_process').execSync;


async function getBlames(file) {

    const ahzamRegex = /.*bardai.*/
    const colbyRegex = /.*sinnock.*/
    const mattRegex = /.*huhman.*/

    const namesWithCounts = {
        ahzam : 0,
        matt : 0,
        colby : 0
    }

    return new Promise((res, rej) => {
        try {
            const exec = execSync(`cd ~/Development/pax8 && git summary --line ${file}`, { encoding: 'utf-8' })
    
            const prune = exec.split('\n').slice(4).join('\n').split('\n').filter(x => x)
                
            const marketplaceBackends = prune
                .map(x => x.split(' ').filter(x => x))
                .filter(x => {
                    const lastName = x.length == 4 ? x[2] : x[1]
                    return [ahzamRegex, colbyRegex, mattRegex].some(x => x.test(lastName.toLowerCase()))
                })
                
            const prunePt2 = marketplaceBackends.map(x => {
                    if( x.length === 4) {
                        x[1] = `${x[1]} ${x[2]}`
                        x.splice(2,1)
                    } 
                    x[2] = x[2].replace('%', '')
                    return x
                })

            prunePt2.forEach(x => {
                if (ahzamRegex.test(x[1].toLowerCase())) namesWithCounts.ahzam += Number(x[2])
                else if (colbyRegex.test(x[1].toLowerCase())) namesWithCounts.colby += Number(x[2])
                else if (mattRegex.test(x[1].toLowerCase())) namesWithCounts.matt += Number(x[2])
            })
            
            res(namesWithCounts)
        }
        catch (err) {
            rej(err)
        }
    })
}

module.exports = { getBlames }
