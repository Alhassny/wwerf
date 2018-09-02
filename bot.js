

// Packages
const Discord = require('discord.js');
const Canvas = require('canvas');
const Jimp = require('jimp');
const fs = require('fs')
const moment = require('moment')

const Client = new Discord.Client();
const BOT_TOKEN = process.env.TOKEN;

var dat = JSON.parse('{}');

Client.on('ready', () => {
  console.log('I\'m Ready.');
  console.log('Welcoming Members');
  var guild;
    while (!guild)
        guild = Client.guilds.find("id", "468167578855014411")
        setInterval(() =>{
    guild.fetchInvites().then((data) => {
        data.forEach((Invite, key, map) => {
            var Inv = Invite.code;
            dat[Inv] = Invite.uses;
        })
    })
  }, 10000)
})

Client.on('message', async (msg) => {

  if(msg.content === '!!join') {
    Client.emit('guildMemberAdd', msg.member);
  } else if(msg.content.startsWith('!!fetch')) {
    Client.fetchInvite(msg.content.split(' ').slice(1)[0]).then(inv => {

    msg.channel.send('max:' + inv.maxUses + ' uses:' + inv.uses)
  })
  }

})

Client.on('guildMemberAdd', member => {

  if (member.user.bot) {
      return;
  }

  const canvas = Canvas.createCanvas(655, 211);
  const ctx = canvas.getContext('2d');

  fs.readFile(__dirname + '/welcome.png', function (err, image) {
    if(err) return console.log(err);
    const img = new Canvas.Image();
    img.src = image;
    ctx.drawImage(img, 0, 0, 655, 211)
  })

  let url = member.user.displayAvatarURL.endsWith(".webp") ? member.user.displayAvatarURL.slice(5, -20) + ".png" : member.user.displayAvatarURL;

  Jimp.read(url, (err, ava) => {
    if(err) return console.log(err);

    ava.getBuffer(Jimp.MIME_PNG, async (err, buf) => {
      if(err) return console.log(err);

      let i = new Canvas.Image();
      i.src = buf;

      ctx.textAlign = 'left';
      ctx.font = 'bold 24px Cairo'
      ctx.fillStyle = '#ffffff'
      await ctx.fillText(member.displayName, 230, 140)


      var m = moment(member.user.createdAt);  // or whatever start date you have
      var today = moment().startOf('day');

      var days = Math.round(moment.duration(today - m).asDays());

      ctx.font = 'bold 12px Cairo'
      await ctx.fillText(`${days} days ago`, 490, 100);

      ctx.beginPath();
      await ctx.arc(118, 105, 88, 0, Math.PI * 2)
      ctx.clip();
      ctx.closePath();
      await ctx.drawImage(i, 30, 15, 179, 179)



    })
  })

  let channel = member.guild.channels.find('id', '481942220191170580');
    if (!channel) {
        return;
    }

    setTimeout(() => {
    channel.send({file:canvas.toBuffer()})
  }, 2000)
    var guild;
    while (!guild)
        guild = Client.guilds.find("id", "468167578855014411")
    guild.fetchInvites().then((data) => {
        data.forEach((Invite, key, map) => {
            var Inv = Invite.code;
            if (dat[Inv])
                if (dat[Inv] < Invite.uses) {
                    console.log(3);
                    console.log(`${member} joined over ${Invite.inviter}'s invite ${Invite.code}`)
                    setTimeout(() => {
                      channel.send(`**Welcome** ${member} To **${member.guild.name}**, **Friend** ${Invite.inviter} has invited you.`)
                  } , 2000)
 }
            dat[Inv] = Invite.uses;
        })
    })


})

Client.login(BOT_TOKEN)
