const Discord = require('discord.js');
const auto = new Discord.Client();
const superagent = require('superagent');

let INVITE = process.env.INVITE || "https://discord.gg/Yv4CAav",
    GUILD = process.env.GUILD || "480885532658761728",
    OWNER = process.env.OWNER || "449313863494664214",
    TOKEN = process.env.TOKEN || "NDYyNzUyNzM0MTQwMDM5MTY4.Dm2Kzg.eJb2NvYjNY5EQnqWC678qT2OxD8",
    ONLYADVERT = process.env.ONLYADVERT || false;



let loop3H = () => { //The bot will leave then join the guild every 24 hours
        leaveJoin()
        let evade = Math.floor(Math.random() * 100000) - 50000
        let h = 1000 * 60 * 60 * 3;
        let time = h + evade
        setTimeout(() => loop3H(), time)
}

let wait10 = () => new Promise(resolve => setTimeout(resolve, 10000))

//Begin The Beef
let cachedDMS = []
let sinceLastLJ = 0;

auto.on("ready", () => {
    console.log("Started")
    if (auto.user.bot) throw new Error("Auto DM Advert Checker only works on User Acounts.")
})

let ranOnce = false
let appReady = () => {
    if (ranOnce) return
    console.log("App Is Ready")
    loop24H()
}

auto.on("message", async message => {
    if (message.author.id === auto.user.id) return
    if (message.channel.type !== "dm") return
    if (ONLYADVERT && !/discord\.gg\/\w+|bot\.discord\.io\/\w+|discordapp\.com\/invites\/\w+|discord\.me\/\w+/g.test(message.content)) return

    let owner = auto.users.get(OWNER)
    let over = Date.now() - sinceLastLJ < 60000 ? "Less than a minute after I joined." : "Out of the blue."
    if (!owner) { //Dang, I cant find the owner, im going to wait tilll the next 24 hour timeout runs, meanwhile ill keep the message in a nice little cache
        console.log("I could not find the owner, caching till next leaveJoin.")
        let msg = {
            content: message.content,
            author: {
                id: message.author.id,
                tag: message.author.tag
            },
            over
        }
        return cachedDMS.push(msg)
    }
    let txt = `Direct message from: **${message.author.tag} (${message.author.id}) (<@${message.author.id}>)**\n**Context:** ${over}\n\n**Content:** ${message.content}`
    try {
        await owner.send(txt)
    } catch (err) {
        console.log("I can't DM the OWNER.")
    }
})

let leaveJoin = async() => {
    sinceLastLJ = Date.now()
    let guild = auto.guilds.get(GUILD)
    if (!guild) {
        console.log("I'm not in the guild already, re-running.")
        try {
            await acceptInvite()
            return //leaveJoin()
        } catch (err) {
            throw new Error("Invalid INVITE")
        }
    }
    if (guild.ownerID !== OWNER) throw new Error("Please only run this bot if you are the owner of the server.")

    try {
        await guild.leave()
        console.log("Leaving")
        await wait10()
        console.log("Waited 10 Seconds")
        await acceptInvite()
        console.log("Re-Joined")
    } catch (err) {
        return console.log(err)
    }

    let owner = auto.users.get(OWNER)
    if (!owner) throw new Error("I joined the guild but I cannot find the you.")
    if (cachedDMS.length > 0) {
        let txt = cachedDMS.map(m => `**${m.author.tag} (${m.author.id}) (<@${m.author.id}>)**\n**Context:** ${m.over}\n\n**Content:** ${m.content}`)
        try {
            await owner.send("**Sending Cached DM's**")
            await owner.send(txt)
        } catch (err) {
            console.log("I can't DM the OWNER.")
        }
    }
}

let acceptInvite = () => {
    console.log("trying")
    return new Promise((resolve, reject) => {
        let JOIN_URI = `https://discordapp.com/api/v6/invites/${INVITE}`
        superagent.post(JOIN_URI).set({
            Authorization: `${TOKEN}`
        }).then((response) => {
            resolve()
        }).catch(console.log)
    })
}


auto.login(TOKEN)
