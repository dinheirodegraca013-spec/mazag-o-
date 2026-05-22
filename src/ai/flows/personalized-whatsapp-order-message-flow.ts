'use server';
/**
 * @fileOverview A Genkit flow for generating personalized WhatsApp order messages.
 *
 * - generatePersonalizedWhatsAppOrderMessage - A function that handles the generation of the WhatsApp message.
 * - PersonalizedWhatsAppOrderMessageInput - The input type for the generatePersonalizedWhatsAppOrderMessage function.
 * - PersonalizedWhatsAppOrderMessageOutput - The return type for the generatePersonalizedWhatsAppOrderMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedWhatsAppOrderMessageInputSchema = z.object({
  customerName: z.string().describe('The full name of the customer.'),
  customerPhone: z.string().describe('The phone number of the customer.'),
  customerEmail: z.string().describe('The email address of the customer.'),
  productName: z.string().optional().describe('The name of the product the customer viewed or intends to order. Optional.'),
});
export type PersonalizedWhatsAppOrderMessageInput = z.infer<typeof PersonalizedWhatsAppOrderMessageInputSchema>;

const PersonalizedWhatsAppOrderMessageOutputSchema = z.object({
  whatsappMessage: z.string().describe('The personalized WhatsApp message ready to be sent.'),
});
export type PersonalizedWhatsAppOrderMessageOutput = z.infer<typeof PersonalizedWhatsAppOrderMessageOutputSchema>;

export async function generatePersonalizedWhatsAppOrderMessage(input: PersonalizedWhatsAppOrderMessageInput): Promise<PersonalizedWhatsAppOrderMessageOutput> {
  return personalizedWhatsAppOrderMessageFlow(input);
}

const personalizedWhatsAppOrderMessagePrompt = ai.definePrompt({
  name: 'personalizedWhatsAppOrderMessagePrompt',
  input: {schema: PersonalizedWhatsAppOrderMessageInputSchema},
  output: {schema: PersonalizedWhatsAppOrderMessageOutputSchema},
  prompt: `You are an AI assistant for Mazagão Gás. Generate a professional and direct WhatsApp message for a customer.

The message must strictly follow this structure:
"Olá, vim pelo site da Mazagão Gás. Meu nome é {{{customerName}}}, meu e-mail é {{{customerEmail}}} e meu telefone é {{{customerPhone}}}. Gostaria de pedir um Gás P13 Prata agora mesmo."

Guidelines:
- Do not add extra conversational filler.
- Keep the tone professional and operational.
- Use the customer's real name, email, and phone provided.
`,
});

const personalizedWhatsAppOrderMessageFlow = ai.defineFlow(
  {
    name: 'personalizedWhatsAppOrderMessageFlow',
    inputSchema: PersonalizedWhatsAppOrderMessageInputSchema,
    outputSchema: PersonalizedWhatsAppOrderMessageOutputSchema,
  },
  async input => {
    const {output} = await personalizedWhatsAppOrderMessagePrompt(input);
    if (!output) {
      throw new Error('Failed to generate WhatsApp message.');
    }
    return output;
  }
);
