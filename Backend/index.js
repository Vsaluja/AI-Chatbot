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

// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});



//   const openai = new OpenAI({
//     apiKey: "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"
//   });

app.post("/", async (req, res) => {
    try {
        // const response = await openai.chat.completions.create({
        //     model: "text-davinci-003",
        //     prompt: req.body.input,
        //     temperature: 0,
        //     max_tokens: 4000,
        //     top_p: 1,
        //     frequency_penalty: 0.5,
        //     presence_penalty: 0,
        // });

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


// const test = async () =>{
//     const completion = await openai.chat.completions.create({
//         messages: [{ role: "system", content: "What is programming ?" }],
//         model: "gpt-3.5-turbo",
//       });

//       console.log(completion.choices[0]);

// }

// test();




app.listen(PORT, () => console.log("Server is running on port 4000"));