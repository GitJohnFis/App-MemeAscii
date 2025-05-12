// noinspection GrazieInspection
'use server';

/**
 * @fileOverview Enhances ASCII art to emphasize meme-like characteristics using AI.
 *
 * - enhanceAsciiMeme - A function that enhances ASCII art for meme generation.
 * - EnhanceAsciiMemeInput - The input type for the enhanceAsciiMeme function.
 * - EnhanceAsciiMemeOutput - The return type for the enhanceAsciiMeme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceAsciiMemeInputSchema = z.object({
  asciiArt: z
    .string()
    .describe('The original ASCII art to be enhanced for meme characteristics.'),
});
export type EnhanceAsciiMemeInput = z.infer<typeof EnhanceAsciiMemeInputSchema>;

const EnhanceAsciiMemeOutputSchema = z.object({
  enhancedAsciiArt: z
    .string()
    .describe('The enhanced ASCII art, now with meme-like characteristics.'),
});
export type EnhanceAsciiMemeOutput = z.infer<typeof EnhanceAsciiMemeOutputSchema>;

export async function enhanceAsciiMeme(input: EnhanceAsciiMemeInput): Promise<EnhanceAsciiMemeOutput> {
  return enhanceAsciiMemeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceAsciiMemePrompt',
  input: {schema: EnhanceAsciiMemeInputSchema},
  output: {schema: EnhanceAsciiMemeOutputSchema},
  prompt: `You are an AI meme artist who specializes in taking boring ASCII art and making it hilarious.\n
        Take the following ASCII art and modify it to emphasize meme characteristics and make it funnier.\n        Make sure to preserve the original structure and content as much as possible, only add details to emphasize the meme characteristics.

        ASCII Art:\n        {{asciiArt}}`,
});

const enhanceAsciiMemeFlow = ai.defineFlow(
  {
    name: 'enhanceAsciiMemeFlow',
    inputSchema: EnhanceAsciiMemeInputSchema,
    outputSchema: EnhanceAsciiMemeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
