'use server';
/**
 * @fileOverview An AI marketing content suggester agent.
 *
 * - aiMarketingContentSuggester - A function that suggests optimized marketing content.
 * - AiMarketingContentSuggesterInput - The input type for the aiMarketingContentSuggester function.
 * - AiMarketingContentSuggesterOutput - The return type for the aiMarketingContentSuggester function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiMarketingContentSuggesterInputSchema = z.object({
  campaignPerformance: z
    .string()
    .describe(
      'A summary of the current campaign performance (e.g., "high CTR, low conversion", "low engagement", "excellent conversion").'
    ),
  userBehaviorInsights: z
    .string()
    .describe(
      'Insights about user behavior (e.g., "users abandon form at step 2", "users respond well to urgency", "mobile users prefer direct WhatsApp contact").'
    ),
  targetAudience: z
    .string()
    .describe('The primary target audience (e.g., "young adults in Guarujá", "families needing quick gas delivery").'),
  productOrService: z
    .string()
    .describe('The specific product or service being marketed (e.g., "P13 gas cylinder delivery", "water delivery").'),
  currentHeadlines: z
    .array(z.string())
    .optional()
    .describe('Optional: Current headlines being used in the campaign.'),
  currentAdCopy: z
    .array(z.string())
    .optional()
    .describe('Optional: Current ad copy being used in the campaign.'),
  currentCTAs: z
    .array(z.string())
    .optional()
    .describe('Optional: Current Calls-to-Action being used in the campaign.'),
});
export type AiMarketingContentSuggesterInput = z.infer<
  typeof AiMarketingContentSuggesterInputSchema
>;

const AiMarketingContentSuggesterOutputSchema = z.object({
  suggestedHeadlines: z
    .array(z.string())
    .describe('Optimized headlines suggested for maximum conversion.'),
  suggestedAdCopy: z
    .array(z.string())
    .describe('Optimized ad copy suggested for maximum conversion.'),
  suggestedCTAs: z
    .array(z.string())
    .describe('Optimized Calls-to-Action suggested for maximum conversion.'),
  reasoning: z
    .string()
    .describe('Explanation of why the suggested content was chosen, based on the input data.'),
});
export type AiMarketingContentSuggesterOutput = z.infer<
  typeof AiMarketingContentSuggesterOutputSchema
>;

export async function aiMarketingContentSuggester(
  input: AiMarketingContentSuggesterInput
): Promise<AiMarketingContentSuggesterOutput> {
  return aiMarketingContentSuggesterFlow(input);
}

const aiMarketingContentSuggesterPrompt = ai.definePrompt({
  name: 'aiMarketingContentSuggesterPrompt',
  input: {schema: AiMarketingContentSuggesterInputSchema},
  output: {schema: AiMarketingContentSuggesterOutputSchema},
  prompt: `You are an expert marketing strategist for Mazagão Gás, a leading gas delivery company in Guarujá.
Your goal is to optimize marketing campaign content to achieve maximum conversion efficiency and impact.

The brand's visual and communication style is "Energia Urbana": a blend of logistics, speed, city, delivery, neon, active operation, and movement. It conveys rapidity, energy, confidence, dominance, strong structure, and a memorable brand. The tone should be modern, energetic, technological, urban, cinematic, fast, aggressive, and premium operational.

Analyze the provided campaign performance and user behavior data to suggest optimized headlines, ad copy, and calls-to-action.
Provide clear reasoning for your suggestions, linking them back to the input data and brand style.

Campaign Performance: {{{campaignPerformance}}}
User Behavior Insights: {{{userBehaviorInsights}}}
Target Audience: {{{targetAudience}}}
Product/Service: {{{productOrService}}}

{{#if currentHeadlines}}Current Headlines:
{{#each currentHeadlines}} - {{{this}}}
{{/each}}{{/if}}

{{#if currentAdCopy}}Current Ad Copy:
{{#each currentAdCopy}} - {{{this}}}
{{/each}}{{/if}}

{{#if currentCTAs}}Current CTAs:
{{#each currentCTAs}} - {{{this}}}
{{/each}}{{/if}}

Based on the above, provide optimized suggestions for headlines, ad copy, and calls-to-action. Ensure the output strictly adheres to the JSON schema for AiMarketingContentSuggesterOutput. Your suggestions should be bold, condensed, impactful, and industrial for headlines, and clear/action-oriented for ad copy/CTAs, all within the "Energia Urbana" brand aesthetic.`,
});

const aiMarketingContentSuggesterFlow = ai.defineFlow(
  {
    name: 'aiMarketingContentSuggesterFlow',
    inputSchema: AiMarketingContentSuggesterInputSchema,
    outputSchema: AiMarketingContentSuggesterOutputSchema,
  },
  async input => {
    const {output} = await aiMarketingContentSuggesterPrompt(input);
    if (!output) {
      throw new Error('Failed to generate marketing content suggestions.');
    }
    return output;
  }
);
