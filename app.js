// ONLY ENABLE IN TEST ENV -- home network messes up certain outgoing connections, rather than manipulate the home network settings, enable this.
if(process.env.isDevEnvironment){
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 
}

const express = require("express");
const session = require("express-session");
const path = require("path");

const port = process.env.PORT || 5000;

const { loginPage } = require("./routes")

const server = express()
                    .use(express.static(path.join(__dirname, "public")))
                    .use(express.json())
                    .use(session({secret: "665db7a1-69ba-49c8-950d-cc6f745a5ff3", resave: true, saveUninitialized: true}))
                    .set("views", path.join(__dirname, "views"))
                    .set("view engine", "pug")
                    .get("/", loginPage)
                    .listen(port)