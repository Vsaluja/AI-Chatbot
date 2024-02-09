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


app.post("/", async (req, res) => {
    try {

        console.log("req", req.body);

        const response = await openai.chat.completions.create({
            messages: [{ role: "system", content: req.body.input }],
            model: "gpt-3.5-turbo",
        });

        console.log(response.choices[0].message.content);

        res.status(200).send(response.choices[0].message.content);



    } catch (error) {
        console.log("FAILED:", req.body.input);
        console.error(error);
        res.status(500).send(error);
    }
});

app.post("/test/:query", async (req, res) => {
    try {
        const query = req.params.query;
        console.log("req", req.body);

        const response = await openai.chat.completions.create({
            messages: [{ role: "system", content: query }],
            model: "gpt-3.5-turbo",
        });

        console.log(response.choices[0].message.content);

        res.status(200).send(response.choices[0].message.content);



    } catch (error) {
        console.log("FAILED:", req.body.input);
        console.error(error);
        res.status(500).send(error);
    }
});


app.listen(PORT, () => console.log("Server is running on port", PORT));