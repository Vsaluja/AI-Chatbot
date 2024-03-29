import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080
app.use(cors());
app.use(express.json());


app.get("/", async (req, res) => {
    res.status(200).send({
        message:
            "This is ChatGPT AI APP server url, please visit https://chatgpt-ai-app-od21.onrender.com",
    });
});


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Making bot remember history 
// https://community.openai.com/t/gpt-3-5-turbo-how-to-remember-previous-messages-like-chat-gpt-website/170370/6

app.post("/", async (req, res) => {
    try {

        const { input, history } = req.body;


        let conversationHistory = history;

        conversationHistory.push({ role: "user", content: input })

        const response = await openai.chat.completions.create({
            // messages: [{ role: "user", content: req.body.input }],
            messages: conversationHistory,
            model: "gpt-3.5-turbo",
        });
        conversationHistory.push({ role: "assistant", content: response.choices[0].message.content })

        console.log(conversationHistory);

        res.status(200).send({ response: response.choices[0].message.content, conversationHistory: conversationHistory });



    } catch (error) {
        console.log("FAILED:", req.body.input);
        console.error(error);
        res.status(500).send(error);
    }
});

let testMessages = [];
app.post("/test/:query", async (req, res) => {
    try {
        const query = req.params.query;
        testMessages.push({ role: "user", content: query })

        const response = await openai.chat.completions.create({
            // messages: [{ role: "user", content: req.body.input }],
            messages: testMessages,
            model: "gpt-3.5-turbo",
        });
        testMessages.push({ role: "assistant", content: response.choices[0].message.content })
        // console.log(response.choices[0].message.content);

        console.log(testMessages);

        res.status(200).send(response.choices[0].message.content);



    } catch (error) {
        console.log("FAILED:", req.body.input);
        console.error(error);
        res.status(500).send(error);
    }
});


app.listen(PORT, () => console.log("Server is running on port", PORT));