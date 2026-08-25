/* eslint-disable @typescript-eslint/no-require-imports */
const { google } = require('@ai-sdk/google');
const { generateObject } = require('ai');
const { z } = require('zod');
require('dotenv').config();

async function test() {
  console.log("Starting generation...");
  try {
    const { object } = await generateObject({
      model: google('gemini-flash-latest'),
      schema: z.object({
        recommendation: z.enum(['APPLY', 'MAYBE', 'SKIP']),
        draftHook: z.string()
      }),
      prompt: "Analyze a job: Build a React app. Return APPLY and a draft hook."
    });
    console.log("Success:", object);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
