
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { processNextJob } from "../../../src/services/ai/ai-job-processor.ts"

/**
 * Supabase Edge Function: process-ai-jobs
 * Entry point for the AI worker.
 */
serve(async (req) => {
  try {
    const result = await processNextJob();
    
    return new Response(
      JSON.stringify(result),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
})
