'use server';
/**
 * @fileOverview AI Flow para análise de bairros e calor de demanda.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NeighborhoodAnalysisInputSchema = z.object({
  addresses: z.array(z.string()).describe('Lista de endereços brutos dos pedidos.'),
});

const NeighborhoodAnalysisOutputSchema = z.object({
  neighborhoods: z.array(z.object({
    name: z.string().describe('Nome do bairro identificado.'),
    count: z.number().describe('Quantidade de pedidos.'),
    intensity: z.number().min(0).max(100).describe('Intensidade de calor de 0 a 100.'),
  })),
  insights: z.string().describe('Análise estratégica da IA sobre a distribuição de demanda.'),
});

export async function analyzeNeighborhoodDemand(input: { addresses: string[] }) {
  return neighborhoodAnalysisFlow(input);
}

const neighborhoodAnalysisPrompt = ai.definePrompt({
  name: 'neighborhoodAnalysisPrompt',
  input: {schema: NeighborhoodAnalysisInputSchema},
  output: {schema: NeighborhoodAnalysisOutputSchema},
  prompt: `Você é o estrategista logístico da Mazagão Gás em Guarujá.
Analise a seguinte lista de endereços e agrupe-os por BAIRRO.

Endereços:
{{#each addresses}}
- {{{this}}}
{{/each}}

Instruções:
1. Extraia o nome do bairro de cada endereço (ex: Enseada, Astúrias, Pitangueiras, Vicente de Carvalho, Paecará, etc).
2. Conte quantos pedidos cada bairro recebeu.
3. Calcule a 'intensity' (0-100) baseada na proporção de pedidos em relação ao total.
4. Forneça um insight estratégico curto sobre onde a Mazagão deve concentrar mais motoboys agora.

Retorne APENAS o JSON estruturado conforme o esquema.`,
});

const neighborhoodAnalysisFlow = ai.defineFlow(
  {
    name: 'neighborhoodAnalysisFlow',
    inputSchema: NeighborhoodAnalysisInputSchema,
    outputSchema: NeighborhoodAnalysisOutputSchema,
  },
  async input => {
    const {output} = await neighborhoodAnalysisPrompt(input);
    if (!output) throw new Error('Falha na análise de demanda.');
    return output;
  }
);
