
'use server';
/**
 * @fileOverview AI Flow para análise de bairros e calor de demanda.
 * Analisa endereços brutos e agrupa por região para inteligência logística.
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
Sua tarefa é analisar uma lista de endereços e extrair o BAIRRO de cada um para gerar um mapa de calor.

Endereços:
{{#each addresses}}
- {{{this}}}
{{/each}}

Instruções Operacionais:
1. Extraia o nome do bairro de cada endereço (ex: Enseada, Astúrias, Pitangueiras, Vicente de Carvalho, Paecará, Morrinhos, Santa Rosa, etc).
2. Conte quantos pedidos cada bairro recebeu.
3. Calcule a 'intensity' (0-100) baseada no volume de pedidos daquele bairro em relação ao total da lista.
4. Forneça um insight estratégico curto (máximo 2 frases) sobre a concentração de demanda atual.

Responda rigorosamente com o JSON estruturado.`,
});

const neighborhoodAnalysisFlow = ai.defineFlow(
  {
    name: 'neighborhoodAnalysisFlow',
    inputSchema: NeighborhoodAnalysisInputSchema,
    outputSchema: NeighborhoodAnalysisOutputSchema,
  },
  async input => {
    try {
      const {output} = await neighborhoodAnalysisPrompt(input);
      if (!output) throw new Error('A IA não retornou dados de análise.');
      return output;
    } catch (error: any) {
      console.error('Erro na análise de bairros Genkit:', error);
      // Fallback básico para não travar a interface
      return {
        neighborhoods: [],
        insights: "Não foi possível processar a análise geográfica no momento devido a uma falha de conexão com a IA."
      };
    }
  }
);
