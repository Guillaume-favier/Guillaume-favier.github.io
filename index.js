// https://discord.com/api/oauth2/authorize?client_id=970270178266984489&redirect_uri=http%3A%2F%2F127.0.0.1%3A5500%2Fapi%2Fredirect&response_type=code&scope=identify
require("dotenv").config();
const express = require("express");
const axios = require("axios")
const url = require("url")
const fs = require("fs");
const path = require("path");
console.log(process.env.DISCORD_OAUTH_CLIENT_ID);

const getHarem = () => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, "harem.json"), "utf8"))
}

const app = express();
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})



app.get("/api/harem", (req, res) => {
    res.status(200).send(getHarem());
})

app.get("/api/redirect", async (req, res) => {
    let code = req.query.code;
    if (code) {
        const formData = new url.URLSearchParams(
            {
                client_id: process.env.DISCORD_OAUTH_CLIENT_ID,
                client_secret: process.env.DISCORD_OAUTH_SECRET,
                grant_type: "authorization_code",
                "code": code.toString(),
                redirect_uri: "http://1ere2.tk:8000/api/redirect"
            }
        )
        try {
            const response = await axios.post("https://discord.com/api/v8/oauth2/token", formData.toString(),
            Headers = {
                "Content-Type": "application/x-www-form-urlencoded"
            })
            const access_token = response.data.access_token;
            console.log(response.data)
            console.log(access_token);
            const userResponse = await axios.get("https://discord.com/api/v8/users/@me",{
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })
            const user = userResponse.data;
            let harem = getHarem();
            let stop = false;
            harem["harem"].forEach(element => {
                if (element.id == user.id) stop = true
            });
            if (stop) {res.status(400).send("Tu es déjà dans le harem"); return}
            harem["harem"].push({"name":user.username,"discriminator":user.discriminator,"avatar":user.avatar,"id":user.id});
            fs.writeFileSync(path.join(__dirname,"harem.json"),JSON.stringify(harem))
            res.send(harem);
            return
        } catch (error) {
            console.log(error);
        }
            
    }
        
        
    res.status(500).send("Error")
    }
)


app.listen(8080, () => {
    console.log("server is running")
});