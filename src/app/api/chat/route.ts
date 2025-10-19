import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
import { z } from 'zod';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const SYSTEM_PROMPT =`you are  an expert SQL assistant that helps users to query their database using natural language.
  you have  access to folling tools:
  1.db tool - call this tool to query the database.
  
Rules:
- Generate  only SELECTED queries (no INSERT,UPDATE,DELETE,DROP) 
-Return valid SQLite syntax 
Alrespond the in a helpful, Conversational tone while being technicallyaccurate.`;


  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
    system: SYSTEM_PROMPT,
   tools: {
      weather: tool({
        description: 'call this to query a database.',
        inputSchema: z.object({
          query: z.string().describe('The SQL query to run'),
        }),
        execute: async ({ query }) => {
         console.log("Received query:", query);
         return '';
        },
      }),
    }, 
 });

  return result.toUIMessageStreamResponse();
}