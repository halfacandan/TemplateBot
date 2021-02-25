const LineBreak = "\n\uFEFF";

module.exports = {
    BotError: function(){
        return "**\\*Blip\\*** *\\*Blip\\** ***\\*Blip\\**** End of Cheese Error";
    },
    AboutThisBot: async function(){

        const BotAuthorDiscordId = '342266718334353408';

        let embeddedMessage = {
            "embed": {
                "title": ":robot:  Template Bot",
                "description": `Template Bot was created by <@!${BotAuthorDiscordId}>. Message him with your ideas for the bot.${LineBreak}`,
                "fields": [             
                    {
                        "name": ":nerd:  Geek Stuff",
                        "value": " * [View the Template Bot's node.js code](https://github.com/halfacandan/TemplateBot)"
                    }
                ]
            }
        };

        return embeddedMessage;
    },
    ListBotCommands: async function(botAboutCommand = "about", botCommandPrefix = "!"){

        commands =   [
            `**${botCommandPrefix}${botAboutCommand}** - Info on how to add new functionality to Template Bot`,
            `**${botCommandPrefix}test** - Reply with a test message`
        ]
        return commands;
    },
    FixBulletPoints: function(text){

        const bulletOne = "\uFEFF\u2001\u2022 ";
        const bulletTwo = "\uFEFF\u2001\u2001\u2043 ";

        // Unordered lists
        text = text.replace(/ \* /g, bulletOne).replace(/ \*\* /g, bulletTwo);
        // Ordered lists
        text = text.replace(/ ([0-9]+(?:\.|\)) )/g, "\uFEFF\u2001$1").replace(/ ([0-9]+\.[0-9]+(?:\.|\)) )/g, "\uFEFF\u2001\u2001$1");

        // Fix any incorrectly-escaped \uFEFF stringification issues
        text = text.replace("\\uFEFF", "\uFEFF");

        return text;
    },
    ParseEmbeddedMessage: async function(discord, embeddedMessage){

        var attachments = null;

        if(typeof embeddedMessage.embed.type === "undefined" || embeddedMessage.embed.type == null){
            embeddedMessage.embed.type = "rich";
        }

        if(typeof embeddedMessage.embed.description !== "undefined" && embeddedMessage.embed.description != null){
            embeddedMessage.embed.description = this.FixBulletPoints(embeddedMessage.embed.description);
        }

        if(typeof embeddedMessage.embed.fields !== "undefined" && embeddedMessage.embed.fields != null){
            for(var i = 0; i < embeddedMessage.embed.fields.length; i++){
                if(typeof embeddedMessage.embed.fields[i].value !== "undefined") {
                    let fixedFieldValue = this.FixBulletPoints(embeddedMessage.embed.fields[i].value);
                    embeddedMessage.embed.fields[i].value = fixedFieldValue;
                }
            }
        }

        if((typeof embeddedMessage.embed.image === "undefined" || embeddedMessage.embed.image == null) 
                && typeof embeddedMessage.embed.table !== "undefined" && embeddedMessage.embed.table != null){

            // The "text-to-image" npm package causes random crashes on Raspberry Pi 4 so use "text2png"
            const text2png = require('text2png');
            let imageStream = text2png(embeddedMessage.embed.table, {
                font: '16px Courier',
                color: 'white',
                bgColor: '#2f3136', // Discord Dark Gray
                lineSpacing: 0,
                padding: 0,
                output: 'buffer'
            });

            if(typeof embeddedMessage.embed.title !== "undefined" && embeddedMessage.embed.title != null){
                imageName = embeddedMessage.embed.title.trim().toLowerCase().replace(/\s/g, "_").replace(/[^a-zA-Z0-9]/ig, "");
            } else {
                imageName = Math.random().toString(36).replace(/[^a-z]+/ig, '').substr(0,5);
            }

            attachments = Array(new discord.MessageAttachment(imageStream, `${imageName}.png`));

            if(attachments != null){
                
                embeddedMessage.files = attachments;                   
                embeddedMessage.embed.image = {
                    "url": `attachment://${imageName}.png`
                }
            }
        }

        if(attachments == null){
            return embeddedMessage;
        } else {
            return { 
                embed: embeddedMessage.embed, 
                files: attachments
            };
        }
    },
    ReactToMesageAsync: async function (bot, message, reactions){

        if(bot == null || message == null || reactions == null) return;

        if(typeof(reactions) === "string"){
            reactions = Array(reactions);
        }

        for(var i=0; i < reactions.length; i++){
            let emojiCode = await this.GetEmojiCodeAsync(bot, reactions[i]);
            if(emojiCode != null){
                var msg = await message.channel.messages.fetch(message.id);
                await msg.react(emojiCode);
            }
        }
    },    
    GetEmojiCodeAsync: async function (bot, emojiShortcode){
        // https://discordjs.guide/popular-topics/reactions.html#custom-emojis

        if(emojiShortcode.match(/:[^:]+:$/g) != null && bot != null){
            var emoji = await bot.emojis.cache.find(emoji => emoji.name == emojiShortcode.replace(/:|:$/g,''));
            if(typeof(emoji) !== "undefined") {
                // This is a custom emoji
                return emoji.id;
            } else {
                // This is an invalid custom emoji
                return null;
            }
        } else {
            // This is a unicode emoji
            return emojiShortcode;
        }
    },
    SendReplies: async function(discord, bot, userMessage, replies, reactions = null, replyToPerson = false){

        if(replies != null){

            var message;
            var finalReplyMessage;

            for(var i=0; i < replies.length; i++){
                if(replyToPerson || userMessage == null || typeof userMessage.channel === "undefined" || userMessage.channel == null){
                    if(typeof replies[i] === "string") {
                        message = "\n" + replies[i];
                    } else {
                        message = await this.ParseEmbeddedMessage(discord, replies[i]);
                    }
                    finalReplyMessage = await userMessage.reply(message);
                } else {
                    if(typeof replies[i] === "string") {
                        finalReplyMessage = await userMessage.channel.send(replies[i], { split: true });
                    } else {
                        message = await this.ParseEmbeddedMessage(discord, replies[i]);
                        finalReplyMessage = await userMessage.channel.send(message);
                    }                
                }
            }

            if(reactions != null){
                let replyMessage = Array.isArray(finalReplyMessage) ? finalReplyMessage[0] : finalReplyMessage;
                await this.ReactToMesageAsync(bot, replyMessage, reactions);
            }
        }

        if(userMessage.channel != null) userMessage.channel.stopTyping();
    }
}