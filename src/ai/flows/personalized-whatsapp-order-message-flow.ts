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
  prompt: `You are an AI assistant for Mazagão Gás, focused on generating highly personalized WhatsApp messages for customers.
Your goal is to make initiating an order as quick and effortless as possible.

Generate a WhatsApp message for a customer based on the provided information. The message should be friendly and encourage the customer to complete their order.

Customer Information:
Name: {{{customerName}}}
Phone: {{{customerPhone}}}
E-mail: {{{customerEmail}}}
{{#if productName}}Product Viewed: {{{productName}}}{{/if}}

Your message should start with "Olá, vim pelo site da Mazagão Gás."
Then, include the customer's name, phone, and email.
If a product name is provided, subtly suggest it in the message.

Example Output format:
whatsappMessage: "Olá, vim pelo site da Mazagão Gás. Meu nome é [Nome], meu telefone é [Telefone] e meu e-mail é [Email]. Gostaria de saber mais sobre [Produto]."
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
