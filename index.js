const { Telegraf } = require("telegraf")
const { Markup } = require("telegraf")
const { Telegram } = require("telegraf")

let TOKEN

const bot = new Telegraf(TOKEN)

const users = {}

const multiplayerUsers = {}

const currentSessions = {}

let ident = 0

function getRandomInt(min, max) {

    min = Math.ceil(min);
    max = Math.floor(max);

    let number = Math.floor(Math.random() * (max - min + 1)) + min
    return number
    
}

function draw(mathMap,mode){
    let replyMessage = []
    let index = 0
    if (mode == "bot"){
        for(row of mathMap){
            for(cell of row){
                if(!cell){
                    replyMessage.push(Markup.button.callback("•",`none${index}`))
                } else if(cell == 1){
                    replyMessage.push(Markup.button.callback("X",1))
                } else if(cell == 2){
                    replyMessage.push(Markup.button.callback("O",2))
                }
                index++
            }
        }
    } else if(mode == "onedevice"){
        for(row of mathMap){
            for(cell of row){
                if(!cell){
                    replyMessage.push(Markup.button.callback("•",`none${index+9}`))
                } else if(cell == 1){
                    replyMessage.push(Markup.button.callback("X",1))
                } else if(cell == 2){
                    replyMessage.push(Markup.button.callback("O",2))
                }
                index++
            }
        }
    } else if(mode == "multiplayer"){
        for(row of mathMap){
            for(cell of row){
                if(!cell){
                    replyMessage.push(Markup.button.callback("•",`none${index+19}`))
                } else if(cell == 1){
                    replyMessage.push(Markup.button.callback("X",1))
                } else if(cell == 2){
                    replyMessage.push(Markup.button.callback("O",2))
                }
                index++
            }
        }
    }
    
    return replyMessage
}

function win(mathMap){
    
    let cellCount = 0

    for(let row of mathMap){
        for (let cell of row){
            if (cell){
                cellCount ++
            }
        }
    }
    
    if ((mathMap[0][0] == mathMap[0][1] && (mathMap[0][0] == mathMap[0][2]) && mathMap[0][0] == 1 )|| 
        (mathMap[1][0] == mathMap[1][1] && (mathMap[1][0] == mathMap[1][2]) && mathMap[1][0] == 1 )||
        (mathMap[2][0] == mathMap[2][1] && (mathMap[2][0] == mathMap[2][2]) && mathMap[2][0] == 1 )||

        (mathMap[0][0] == mathMap[1][0] && (mathMap[0][0] == mathMap[2][0]) && mathMap[0][0] == 1 )||
        (mathMap[0][1] == mathMap[1][1] && (mathMap[0][1] == mathMap[2][1]) && mathMap[0][1] == 1 )||
        (mathMap[0][2] == mathMap[1][2] && (mathMap[0][2] == mathMap[2][2]) && mathMap[0][2] == 1 )||

        (mathMap[0][0] == mathMap[1][1] && (mathMap[0][0] == mathMap[2][2]) && mathMap[0][0] == 1 )||
        (mathMap[0][2] == mathMap[1][1] && (mathMap[0][2] == mathMap[2][0]) && mathMap[0][2] == 1 )){
        return 1
    } else if ((mathMap[0][0] == mathMap[0][1] && (mathMap[0][0] == mathMap[0][2]) && mathMap[0][0] == 2 )|| 
        (mathMap[1][0] == mathMap[1][1] && (mathMap[1][0] == mathMap[1][2]) && mathMap[1][0] == 2 )||
        (mathMap[2][0] == mathMap[2][1] && (mathMap[2][0] == mathMap[2][2]) && mathMap[2][0] == 2 )||

        (mathMap[0][0] == mathMap[1][0] && (mathMap[0][0] == mathMap[2][0]) && mathMap[0][0] == 2 )||
        (mathMap[0][1] == mathMap[1][1] && (mathMap[0][1] == mathMap[2][1]) && mathMap[0][1] == 2 )||
        (mathMap[0][2] == mathMap[1][2] && (mathMap[0][2] == mathMap[2][2]) && mathMap[0][2] == 2 )||

        (mathMap[0][0] == mathMap[1][1] && (mathMap[0][0] == mathMap[2][2]) && mathMap[0][0] == 2 )||
        (mathMap[0][2] == mathMap[1][1] && (mathMap[0][2] == mathMap[2][0]) && mathMap[0][2] == 2 )){
        return 2
    } else if (cellCount == 9){
        return 3 
    }
}

bot.start((ctx)=>{
    ctx.reply("Hello! I am bot which created by World IT student!")
})

bot.command("gameModes",(ctx)=>{
    ctx.reply("Choose action: ",Markup.inlineKeyboard(
        [Markup.button.callback("Singleplayer","singleplayer"),
        Markup.button.callback("Multiplayer","multiplayer")],{columns:2}
        ).resize())
})

bot.action("gameModes",(ctx)=>{
    ctx.reply("Choose action: ",Markup.inlineKeyboard(
        [Markup.button.callback("Singleplayer","singleplayer"),
        Markup.button.callback("Multiplayer","multiplayer")],{columns:2}
        ).resize())
})

bot.action("multiplayer",(ctx)=>{
    let replyMessage = [
        Markup.button.callback('Update list','multiplayer'),
        Markup.button.callback('Back','BackMulti')
    ]
    multiplayerUsers[ctx.from.id] = [ctx.from.username,ctx.chat.id]
    let allPlayers = Object.keys(multiplayerUsers)
    let avaiblePlayers = []
    for(let player of allPlayers){
        if(player != ctx.from.id){
            avaiblePlayers.push(player)
        }
    }
    for(let avPlayer of avaiblePlayers){
        replyMessage.push(Markup.button.callback(`${multiplayerUsers[avPlayer][0]}`,`${avPlayer}`))
    } 
    ctx.reply("Choose your opponent: ",Markup.inlineKeyboard(
        replyMessage,{columns:2}
    ))
    sendGame()
})
function sendGame(){ 
    let replyMessage = [
        Markup.button.callback('Accept','accept'),
        Markup.button.callback('Deciline','Deciline')
    ]

    for(let player of Object.keys(multiplayerUsers)){
        bot.action(player,(ctx)=>{ 
            let currentUser = ctx
            ctx.reply(`Waiting for answer from ${multiplayerUsers[player][0]}`)
            bot.telegram.sendMessage(multiplayerUsers[player][1],`User ${multiplayerUsers[ctx.from.id][0]} inviting you`,Markup.inlineKeyboard(
                replyMessage,{columns:2}
            ))
            bot.action("accept",(ctx)=>{
                delete multiplayerUsers[currentUser.from.id]
                delete multiplayerUsers[ctx.from.id]
                ident += 1
                let session = ident
                currentSessions[ident] =[[
                    [NaN,NaN,NaN],
                    [NaN,NaN,NaN],
                    [NaN,NaN,NaN]
                ],currentUser.chat.id, ctx.chat.id] 
                console.log(currentUser.chat.id, ctx.chat.id)
                multiplayerGame(session)
            })
        })

    }
}

bot.action("BackMulti",(ctx)=>{
    delete multiplayerUsers[ctx.from.id]
    console.log(multiplayerUsers)
    ctx.reply("Choose action: ",Markup.inlineKeyboard(
        [Markup.button.callback("Singleplayer","singleplayer"),
        Markup.button.callback("Multiplayer","multiplayer")],{columns:2}
        ).resize())
})

bot.action("singleplayer",(ctx)=>{
    ctx.reply("Choose action: ",Markup.inlineKeyboard(
        [Markup.button.callback("Vs bot","bot"),
        Markup.button.callback("Vs friend (on one device)","onedevice")],{columns:2}
        ).resize())
})

bot.action("onedevice",(ctx)=>{
    let mathMap = [
        [NaN,NaN,NaN],
        [NaN,NaN,NaN],
        [NaN,NaN,NaN]
    ]
    
    users[ctx.from.id] = [mathMap,1]

    let replyMessage = draw(users[ctx.from.id][0],"onedevice")
    if (!win(users[ctx.from.id][0])){
        ctx.reply("Choose your possition: ",Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
    }
    console.log("Device1")
    oneDevice()
})

bot.action("bot",(ctx)=>{
    ctx.reply("Choose action: ",Markup.inlineKeyboard(
        [Markup.button.callback("Cross","botCross"),
        Markup.button.callback("Zero","botZero")],{columns:2}
        ).resize())
})

bot.action("botCross",(ctx)=>{

    let mathMap = [
        [NaN,NaN,NaN],
        [NaN,NaN,NaN],
        [NaN,NaN,NaN]
    ]
    
    users[ctx.from.id] = [mathMap,1]

    let replyMessage = draw(users[ctx.from.id][0],"bot")
    if (!win(users[ctx.from.id][0])){
        ctx.reply("Choose your possition: ",Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
    }
    console.log("Bot1")
    vsBot()
})

bot.action("botZero",(ctx)=>{

    let mathMap = [
        [NaN,NaN,NaN],
        [NaN,NaN,NaN],
        [NaN,NaN,NaN]
    ]
    
    users[ctx.from.id] = [mathMap,2]
    
    let botChoise = getRandomInt(0,8)

    if((botChoise == 0 || botChoise == 1 || botChoise == 2)){ 
        if(users[ctx.from.id][1] == 1){
            users[ctx.from.id][0][0][botChoise] = 2
        } else {
            users[ctx.from.id][0][0][botChoise] = 1
        }
        let replyMessage = draw(users[ctx.from.id][0],"bot")
        if (!win(users[ctx.from.id][0])){
            ctx.reply("Choose your possition: ",Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
        } //:3 
         
    } else if((botChoise == 3 || botChoise == 4 || botChoise == 5)){
        if(users[ctx.from.id][1] == 1){
            users[ctx.from.id][0][1][botChoise-3] = 2
        } else {
            users[ctx.from.id][0][1][botChoise-3] = 1 
        }
        let replyMessage = draw(users[ctx.from.id][0],"bot")
        if (!win(users[ctx.from.id][0])){
            ctx.reply("Choose your possition: ",Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
        }
        
    } else if((botChoise == 6 || botChoise == 7 || botChoise == 8)){
        if(users[ctx.from.id][1] == 1){
            users[ctx.from.id][0][2][botChoise-6] = 2
        } else {
            users[ctx.from.id][0][2][botChoise-6] = 1
        }
        let replyMessage = draw(users[ctx.from.id][0],"bot")
        if (!win(users[ctx.from.id][0])){
            ctx.reply("Choose your possition: ",Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
        }
    }
    console.log("Bot1")
    vsBot()
})

function multiplayerGame(sessionIndex){
    console.log("started")
    let replyMessage = draw(currentSessions[sessionIndex][0],"multiplayer")
    bot.telegram.sendMessage(currentSessions[sessionIndex][1],"Choose your possition: ",Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
    bot.telegram.sendMessage(currentSessions[sessionIndex][2],"Waiting for opponent choose:3",Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
    
    let firstPlayer = currentSessions[sessionIndex][1]
    let seccondPlayer = currentSessions[sessionIndex][2]
    
    console.log("1-"+firstPlayer)
    console.log("2-"+seccondPlayer)
    let line = {}
    line[firstPlayer] = 1
    line[seccondPlayer] = 2

    for(let button = 0; button <= 8;button++){ 
        bot.action(`none${button+19}`,(ctx) =>{
            console.log("Started 2")
            console.log("Pohodil "+ctx.from.id)
            if (!win(currentSessions[sessionIndex][0])){
                let third = firstPlayer
                console.log("Third -"+ third)
                console.log("First-"+firstPlayer)
                if(Number(firstPlayer) == Number(ctx.from.id)) {
                    if((button == 0 || button == 1 || button == 2)&& !currentSessions[sessionIndex][0][0][button]){
                        currentSessions[sessionIndex][0][0][button] = line[firstPlayer]
                    } else if((button == 3 || button == 4 || button == 5)&& !currentSessions[sessionIndex][0][1][button-3]){
                        currentSessions[sessionIndex][0][1][button-3] = line[firstPlayer]  
                    } else if((button == 6 || button == 7 || button == 8)&& !currentSessions[sessionIndex][0][2][button-6]){
                        currentSessions[sessionIndex][0][2][button-6] = line[firstPlayer]
                    }
                    firstPlayer = seccondPlayer 
                    seccondPlayer = third
                    
                    replyMessage = draw(currentSessions[sessionIndex][0],"multiplayer")
                    if(!win(currentSessions[sessionIndex][0])){
                        bot.telegram.sendMessage(firstPlayer,"Choose your possition: ",Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                        bot.telegram.sendMessage(seccondPlayer,"Waiting for opponent choose:3",Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                    } else {
                        console.log("Final blet")
                        replyMessage = draw(currentSessions[sessionIndex][0],"multiplayer")
                        if (win(currentSessions[sessionIndex][0]) == 1){
                            replyMessage.push(Markup.button.callback("Back","gameModes"))
                            bot.telegram.sendMessage(firstPlayer,`Winner is x!`,Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                            bot.telegram.sendMessage(seccondPlayer,`Winner is x! `,Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                        } else if (win(currentSessions[sessionIndex][0]) == 2){ 
                            replyMessage.push(Markup.button.callback("Back","gameModes"))
                            bot.telegram.sendMessage(firstPlayer,`Winner is O!`,Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                            bot.telegram.sendMessage(seccondPlayer,`Winner is O!`,Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                        } else if (win(currentSessions[sessionIndex][0]) == 3){
                            replyMessage.push(Markup.button.callback("Back","gameModes"))
                            bot.telegram.sendMessage(firstPlayer,'There is no winner (',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                            bot.telegram.sendMessage(seccondPlayer,'There is no winner (',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                        }
                        seccondPlayer = firstPlayer
                        firstPlayer = third
                        delete currentSessions[sessionIndex]
                        Markup.removeKeyboard(replyMessage)

                    }
                } else{
                    console.log("Запрещаю тебе быть:3") // краткая истоия моей жизни
                }

            } else{
                console.log("Final blet")
                replyMessage = draw(currentSessions[sessionIndex][0],"multiplayer")
                if (win(currentSessions[sessionIndex][0]) == 1){
                    replyMessage.push(Markup.button.callback("Back","gameModes"))
                    bot.telegram.sendMessage(firstPlayer,`Winner is x! (${firstPlayer})`,Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                    bot.telegram.sendMessage(seccondPlayer,`Winner is x! (${firstPlayer})`,Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                } else if (win(currentSessions[sessionIndex][0]) == 2){
                    replyMessage.push(Markup.button.callback("Back","gameModes"))
                    bot.telegram.sendMessage(firstPlayer,'Winner is O!',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                    bot.telegram.sendMessage(seccondPlayer,'Winner is O!',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                } else if (win(currentSessions[sessionIndex][0]) == 3){
                    replyMessage.push(Markup.button.callback("Back","gameModes"))
                    bot.telegram.sendMessage(firstPlayer,'There is no winner (',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                    bot.telegram.sendMessage(seccondPlayer,'There is no winner (',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                }
                delete currentSessions[sessionIndex]
                Markup.removeKeyboard(replyMessage)
            }    
        })   
    }
}

function vsBot(){
    for(let button = 0; button <= 8;button++){ 
        bot.action(`none${button}`,(ctx)=>{
            function geg2(button){
                let botChoise = getRandomInt(0,8)
    
                if((botChoise == 0 || botChoise == 1 || botChoise == 2)&& !users[ctx.from.id][0][0][botChoise] && botChoise != button){ 
                    if(users[ctx.from.id][1] == 1){
                        users[ctx.from.id][0][0][botChoise] = 2
                    } else {
                        users[ctx.from.id][0][0][botChoise] = 1
                    }
                    let replyMessage = draw(users[ctx.from.id][0],"bot")
                    ctx.reply("Choose your possition: ",Markup.inlineKeyboard(replyMessage,{columns:3}).resize()) //:3 
                     
                } else if((botChoise == 3 || botChoise == 4 || botChoise == 5)&& !users[ctx.from.id][0][1][botChoise-3] && botChoise != button){
                    if(users[ctx.from.id][1] == 1){
                        users[ctx.from.id][0][1][botChoise-3] = 2
                    } else {
                        users[ctx.from.id][0][1][botChoise-3] = 1 
                    }
                    let replyMessage = draw(users[ctx.from.id][0],"bot")
                    ctx.reply("Choose your possition: ",Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                    
                } else if((botChoise == 6 || botChoise == 7 || botChoise == 8)&& !users[ctx.from.id][0][2][botChoise-6] && botChoise != button){
                    if(users[ctx.from.id][1] == 1){
                        users[ctx.from.id][0][2][botChoise-6] = 2
                    } else {
                        users[ctx.from.id][0][2][botChoise-6] = 1
                    }
                    let replyMessage = draw(users[ctx.from.id][0],"bot")
                    ctx.reply("Choose your possition: ",Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                } else {
                    geg2(button)
                } 
            }
            
            if((button == 0 || button == 1 || button == 2)&& !users[ctx.from.id][0][0][button]){
                users[ctx.from.id][0][0][button] = users[ctx.from.id][1]
            } else if((button == 3 || button == 4 || button == 5)&& !users[ctx.from.id][0][1][button-3]){
                users[ctx.from.id][0][1][button-3] = users[ctx.from.id][1]
            } else if((button == 6 || button == 7 || button == 8)&& !users[ctx.from.id][0][2][button-6]){
                users[ctx.from.id][0][2][button-6] = users[ctx.from.id][1] 
            }
    
            if(!win(users[ctx.from.id][0])){
                geg2(button)
                let replyMessage = draw(users[ctx.from.id][0],"bot") 
                if(win(users[ctx.from.id][0])){
                    if (win(users[ctx.from.id][0]) == 2){ // :3
                        replyMessage.push(Markup.button.callback("Again","bot"),Markup.button.callback("Back","gameModes"))
                        ctx.reply('Winner is O!',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                    } else if (win(users[ctx.from.id][0]) == 1){
                        replyMessage.push(Markup.button.callback("Again","bot"),Markup.button.callback("Back","gameModes"))
                        ctx.reply('Winner is X!',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                    } else if (win(users[ctx.from.id][0]) == 3){
                        replyMessage.push(Markup.button.callback("Again","bot"),Markup.button.callback("Back","gameModes"))
                        ctx.reply('There is no winner (',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                    }
                    Markup.removeKeyboard()
                } 
            } else {
                let replyMessage = draw(users[ctx.from.id][0],"bot")
                if (win(users[ctx.from.id][0]) == 1){
                    replyMessage.push(Markup.button.callback("Again","bot"),Markup.button.callback("Back","gameModes"))
                    ctx.reply('Winner is X!',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                } else if (win(users[ctx.from.id][0]) == 2){
                    replyMessage.push(Markup.button.callback("Again","bot"),Markup.button.callback("Back","gameModes"))
                    ctx.reply('Winner is O!',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                } else if (win(users[ctx.from.id][0]) == 3){
                    replyMessage.push(Markup.button.callback("Again","bot"),Markup.button.callback("Back","gameModes"))
                    ctx.reply('There is no winner (',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                }
                Markup.removeKeyboard()
            } 
        }
        )
    }
}
function oneDevice(){
    for(let button = 0; button <= 8;button++){ 
        console.log("Device2")
        bot.action(`none${button+9}`,(ctx)=>{
            console.log("Device")
            if (!win(users[ctx.from.id][0])){
                if (users[ctx.from.id][1] == 1){
                    if((button == 0 || button == 1 || button == 2)&& !users[ctx.from.id][0][0][button]){
                        users[ctx.from.id][0][0][button] = 1
                    } else if((button == 3 || button == 4 || button == 5)&& !users[ctx.from.id][0][1][button-3]){
                        users[ctx.from.id][0][1][button-3] = 1
                    } else if((button == 6 || button == 7 || button == 8)&& !users[ctx.from.id][0][2][button-6]){
                        users[ctx.from.id][0][2][button-6] = 1
                    }
                    let replyMessage = draw(users[ctx.from.id][0],"onedevice")
                    if (!win(users[ctx.from.id][0])){
                        users[ctx.from.id][1] = 2
                        ctx.reply("Choose your possition: ",Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                    } else {
                        if (win(users[ctx.from.id][0]) == 1){
                            replyMessage.push(Markup.button.callback("Again","onedevice"),Markup.button.callback("Back","gameModes"))
                            ctx.reply('Winner is X!',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                        } else if (win(users[ctx.from.id][0]) == 2){
                            replyMessage.push(Markup.button.callback("Again","onedevice"),Markup.button.callback("Back","gameModes"))
                            ctx.reply('Winner is O!',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                        } else if (win(users[ctx.from.id][0]) == 3){
                            replyMessage.push(Markup.button.callback("Again","onedevice"),Markup.button.callback("Back","gameModes"))
                            ctx.reply('There is no winner (',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                        }
                        Markup.removeKeyboard()
                    }
                } else if (users[ctx.from.id][1] == 2){
                    if((button == 0 || button == 1 || button == 2)&& !users[ctx.from.id][0][0][button]){
                        users[ctx.from.id][0][0][button] = 2
                    } else if((button == 3 || button == 4 || button == 5)&& !users[ctx.from.id][0][1][button-3]){
                        users[ctx.from.id][0][1][button-3] = 2
                    } else if((button == 6 || button == 7 || button == 8)&& !users[ctx.from.id][0][2][button-6]){
                        users[ctx.from.id][0][2][button-6] = 2
                    }
                    let replyMessage = draw(users[ctx.from.id][0],"onedevice")
                    if (!win(users[ctx.from.id][0])){
                        users[ctx.from.id][1] = 1
                        ctx.reply("Choose your possition: ",Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                    } else {
                        if (win(users[ctx.from.id][0]) == 1){
                            replyMessage.push(Markup.button.callback("Again","onedevice"),Markup.button.callback("Back","gameModes"))
                            ctx.reply('Winner is X!',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                        } else if (win(users[ctx.from.id][0]) == 2){
                            replyMessage.push(Markup.button.callback("Again","onedevice"),Markup.button.callback("Back","gameModes"))
                            ctx.reply('Winner is O!',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                        } else if (win(users[ctx.from.id][0]) == 3){
                            replyMessage.push(Markup.button.callback("Again","onedevice"),Markup.button.callback("Back","gameModes"))
                            ctx.reply('There is no winner (',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                        }
                        Markup.removeKeyboard()
                    }
                }
            } else {
                let replyMessage = draw(users[ctx.from.id][0],"onedevice")
                if (win(users[ctx.from.id][0]) == 1){
                    replyMessage.push(Markup.button.callback("Again","onedevice"),Markup.button.callback("Back","gameModes"))
                    ctx.reply('Winner is X!',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                } else if (win(users[ctx.from.id][0]) == 2){
                    replyMessage.push(Markup.button.callback("Again","onedevice"),Markup.button.callback("Back","gameModes"))
                    ctx.reply('Winner is O!',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                } else if (win(users[ctx.from.id][0]) == 3){
                    replyMessage.push(Markup.button.callback("Again","onedevice"),Markup.button.callback("Back","gameModes"))
                    ctx.reply('There is no winner (',Markup.inlineKeyboard(replyMessage,{columns:3}).resize())
                }
                Markup.removeKeyboard()
            }
        })
    }
}

bot.launch()
