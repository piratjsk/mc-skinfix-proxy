const http = require('http')
const request = require('request-promise-native');
const knownUUIDs = new Map()

const server = http.createServer(async function(req, res) {
    const {method, url} = req
    if (isSkinRequest(url) || isCapeRequest(url)) {
        const name = getName(url)
        const uuid = await getUUID(name)
        const newUrl = `https://crafatar.com/${isCapeRequest(url) ? 'capes' : 'skins'}/${uuid}`
        console.log(`[mc-skinfix-proxy] ${method} ${url} -> ${newUrl}`)
        req.pipe(request(newUrl)).pipe(res)
    }
})

function isSkinRequest(url) {
    return url.startsWith("http://s3.amazonaws.com/MinecraftSkins/")
            || url.startsWith("http://skins.minecraft.net/MinecraftSkins/")
            || url.startsWith("http://www.minecraft.net/skin/")
}

function isCapeRequest(url) {
    return url.startsWith("http://s3.amazonaws.com/MinecraftCloaks/")
}

function getName(url) {
    return url.match("/([a-zA-Z0-9_]{2,16}).png")[1]
}

async function getUUID(name) {
    if (knownUUIDs.has(name))
        return knownUUIDs.get(name)
    const data = await request({uri:`https://api.mojang.com/users/profiles/minecraft/${name}`,json:true})
    const uuid = data.id
    knownUUIDs.set(name, uuid)
    return uuid
}

const port = 9000
server.listen(port);
console.log("[mc-skinfix-proxy] Listening on :" + port)