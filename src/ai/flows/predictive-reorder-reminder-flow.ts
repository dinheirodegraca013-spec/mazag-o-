'use server';
/**
 * @fileOverview A Genkit flow for sending predictive reorder reminders to Mazagão Gás customers.
 *
 * - predictiveReorderReminder - A function that handles the predictive reorder reminder process.
 * - PredictiveReorderReminderInput - The input type for the predictiveReorderReminder function.
 * - PredictiveReorderReminderOutput - The return type for the predictiveReorderReminder function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictiveReorderReminderInputSchema = z.object({
  customerId: z.string().describe('Unique identifier for the customer.'),
  customerName: z.string().describe("The customer's full name."),
  customerWhatsapp: z.string().describe("The customer's WhatsApp number."),
  purchaseHistory: z.array(z.object({
    productId: z.string().describe('The ID of the purchased product (e.g., "P13", "P5").'),
    purchaseDate: z.string().describe('The date of purchase in YYYY-MM-DD format (e.g., "2023-10-26").'),
  })).describe('An ordered list of recent purchases for the customer, most recent first.'),
  averageConsumptionDays: z.number().describe('The estimated number of days a gas cylinder typically lasts for this customer.'),
});
export type PredictiveReorderReminderInput = z.infer<typeof PredictiveReorderReminderInputSchema>;

const PredictiveReorderReminderOutputSchema = z.object({
  shouldSendReminder: z.boolean().describe('True if a reminder should be sent, false otherwise.'),
  reminderMessage: z.string().optional().describe('The personalized reminder message to send via WhatsApp, if a reminder is needed.'),
  customerWhatsapp: z.string().describe("The customer's WhatsApp number for sending the message."),
});
export type PredictiveReorderReminderOutput = z.infer<typeof PredictiveReorderReminderOutputSchema>;

const predictiveReorderPrompt = ai.definePrompt({
  name: 'predictiveReorderReminderPrompt',
  input: {
    schema: PredictiveReorderReminderInputSchema.extend({
      currentDate: z.string().describe('The current date in YYYY-MM-DD format (e.g., "2024-05-15").'),
      latestPurchaseDate: z.string().optional().describe('The date of the most recent purchase in YYYY-MM-DD format.'),
      expectedReorderDate: z.string().optional().describe('The calculated date when a reorder is expected, based on average consumption, in YYYY-MM-DD format.'),
      daysUntilExpectedReorder: z.number().optional().describe('Number of days from current date until expected reorder date. Negative if expected reorder date has passed.'),
    }),
  },
  output: { schema: PredictiveReorderReminderOutputSchema },
  prompt: `You are an intelligent assistant for Mazagão Gás, responsible for helping customers avoid running out of gas unexpectedly. Your goal is to determine if a customer needs a predictive reorder reminder and, if so, craft a friendly, persuasive message for WhatsApp.

Here is the customer's information:
Customer Name: {{{customerName}}}
Customer WhatsApp: {{{customerWhatsapp}}}
Current Date: {{{currentDate}}}

Customer's purchase history (most recent first):
{{#each purchaseHistory}}
- Product: {{{productId}}}, Date: {{{purchaseDate}}}
{{/each}}

Average gas cylinder consumption for this customer: {{{averageConsumptionDays}}} days.

Based on the provided purchase history, the latest purchase was on: {{{latestPurchaseDate}}}.
Considering the average consumption, the customer is expected to need a reorder around: {{{expectedReorderDate}}}.
Days until expectedReorder: {{{daysUntilExpectedReorder}}}

**Decision Logic:**
1.  If there is no purchase history, do NOT send a reminder. Set 'shouldSendReminder' to false.
2.  If the 'expectedReorderDate' is on or before the 'currentDate', OR if 'daysUntilExpectedReorder' is between -7 and 3 (i.e., expected reorder was up to 7 days ago or is within the next 3 days), then a reminder SHOULD be sent.
3.  Otherwise, a reminder is NOT needed at this time.

**If a reminder IS needed:**
Craft a polite and helpful WhatsApp message for {{{customerName}}}. The message should:
-   Start with "Olá {{{customerName}}}!"
-   Mention that based on their usual consumption, it might be time to check their gas supply.
-   Offer quick delivery from Mazagão Gás.
-   Include a call to action to reply to this message to place an order or visit the Mazagão Gás website.
-   Keep the message concise and friendly.

**Example message structure for a reminder:**
"Olá [Customer Name]! 👋
Pelo nosso sistema, parece que o seu gás [produto, if known] pode estar acabando por agora! Não deixe faltar energia na sua casa. 🏡
A Mazagão Gás entrega rapidinho em Guarujá. 🚀
Que tal pedir agora mesmo? Responda essa mensagem ou acesse nosso site! ✨"

Make sure to include the customer's WhatsApp number in the output, even if no reminder is sent.
`
});

const predictiveReorderReminderFlow = ai.defineFlow(
  {
    name: 'predictiveReorderReminderFlow',
    inputSchema: PredictiveReorderReminderInputSchema,
    outputSchema: PredictiveReorderReminderOutputSchema,
  },
  async (input) => {
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"

    let latestPurchaseDateStr: string | undefined;
    let expectedReorderDateStr: string | undefined;
    let daysUntilExpectedReorder: number | undefined;

    if (input.purchaseHistory && input.purchaseHistory.length > 0) {
      // Assuming purchaseHistory is sorted most recent first, or find the latest
      latestPurchaseDateStr = input.purchaseHistory[0].purchaseDate;
      const latestPurchaseDate = new Date(latestPurchaseDateStr);

      // Calculate expected reorder date
      const expectedReorderDate = new Date(latestPurchaseDate);
      expectedReorderDate.setDate(latestPurchaseDate.getDate() + input.averageConsumptionDays);
      expectedReorderDateStr = expectedReorderDate.toISOString().split('T')[0];

      // Calculate days until expected reorder
      const diffTime = expectedReorderDate.getTime() - today.getTime();
      daysUntilExpectedReorder = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const promptInput = {
      ...input,
      currentDate,
      latestPurchaseDate: latestPurchaseDateStr,
      expectedReorderDate: expectedReorderDateStr,
      daysUntilExpectedReorder,
    };

    const { output } = await predictiveReorderPrompt(promptInput);
    return output!;
  }
);

export async function predictiveReorderReminder(input: PredictiveReorderReminderInput): Promise<PredictiveReorderReminderOutput> {
  return predictiveReorderReminderFlow(input);
}
