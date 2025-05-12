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
        Take the following ASCII art and modify it to emphasize meme characteristics and make it funnier.\n
        Make sure to preserve the original structure and content as much as possible, only add details to emphasize the meme characteristics.
        Only use standard printable ASCII characters (Unicode U+0020 to U+007E), newlines, and the block characters (░▒▓█ - U+2591, U+2592, U+2593, U+2588) in your output. Do not use other symbols or Unicode characters.

        ASCII Art:\n
        {{{asciiArt}}}`,
});

const enhanceAsciiMemeFlow = ai.defineFlow(
  {
    name: 'enhanceAsciiMemeFlow',
    inputSchema: EnhanceAsciiMemeInputSchema,
    outputSchema: EnhanceAsciiMemeOutputSchema,
  },
  async (rawInput: EnhanceAsciiMemeInput) => {
    // Sanitize asciiArt to remove problematic characters that cause "ByteString" errors.
    // Allowed characters:
    // - Basic printable ASCII (U+0020 to U+007E)
    // - Newline (LF - U+000A), Carriage Return (CR - U+000D)
    // - Block characters used in charsets (U+2591, U+2592, U+2593, U+2588)
    // Replace any other character with a space.
    const sanitizedAsciiArt = rawInput.asciiArt.replace(
      /[^\u0020-\u007E\u000A\u000D\u2591\u2592\u2593\u2588]/g,
      ' '
    );

    const processedInput: EnhanceAsciiMemeInput = { ...rawInput, asciiArt: sanitizedAsciiArt };
    
    const {output} = await prompt(processedInput);
    if (!output) {
        throw new Error("AI did not return an output for ASCII enhancement.");
    }
    // Optionally, sanitize the output as well, though the prompt now instructs the AI on allowed characters.
    const sanitizedOutputAsciiArt = output.enhancedAsciiArt.replace(
      /[^\u0020-\u007E\u000A\u000D\u2591\u2592\u2593\u2588]/g,
      ' '
    );

    return { enhancedAsciiArt: sanitizedOutputAsciiArt };
  }
);