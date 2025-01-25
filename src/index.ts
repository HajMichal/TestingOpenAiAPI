import { Hono } from "hono";
import { z } from "zod";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

type ENV = {
  APIKEY: string;
};
const app = new Hono<{ Bindings: ENV }>();

const responseFormat = z.object({
  excercises: z.array(
    z.object({
      difficulty: z.string(),
      content: z.string(),
    })
  ),
});
app.get("/", async (c) => {
  const openai = new OpenAI({ apiKey: c.env.APIKEY });
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a english language teacher, create 4 different exercises for your student to practice this what user wants to learn. Give him different level of difficulty. He already can speak and write in english on B2 level",
      },
      {
        role: "user",
        content: "Chcialbym poćwiczyć Present Simple oraz Present Continuous",
      },
    ],
    response_format: zodResponseFormat(responseFormat, "excercises"),
    // store: true,
  });

  if (completion.choices[0].message.parsed?.excercises) {
    console.log(completion.choices[0].message.parsed.excercises);
    return c.text(
      completion.choices[0].message.parsed.excercises[3].difficulty ??
        "No response"
    );
  } else {
    return c.text("No response");
  }
});

export default app;
