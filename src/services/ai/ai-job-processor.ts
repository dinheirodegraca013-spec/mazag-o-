
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generatePersonalizedWhatsAppOrderMessage } from '@/ai/flows/personalized-whatsapp-order-message-flow';
import { aiMarketingContentSuggester } from '@/ai/flows/ai-marketing-content-suggester-flow';
import { predictiveReorderReminder } from '@/ai/flows/predictive-reorder-reminder-flow';
import { hashPrompt, hashContext, hashOutput } from '@/lib/ai/hashing';
import { AiJob } from '@/types/ai';

/**
 * AI Job Processor Service.
 * Maps job types to Genkit flows and handles the persistence/event lifecycle.
 */
export async function processNextJob() {
  if (!supabaseAdmin) throw new Error('Supabase Admin Client not available');

  // 1. Claim Job safely via RPC (atomic FOR UPDATE SKIP LOCKED)
  const { data: job, error: claimError } = await supabaseAdmin.rpc('claim_ai_job');

  if (claimError) throw claimError;
  if (!job) return { ok: true, processed: 0 };

  const aiJob = job as AiJob;

  try {
    // 2. Execute AI Flow based on job type
    let result: any;
    
    switch (aiJob.type) {
      case 'whatsapp_order_message':
        result = await generatePersonalizedWhatsAppOrderMessage(aiJob.payload);
        break;
      case 'marketing_suggestion':
        result = await aiMarketingContentSuggester(aiJob.payload);
        break;
      case 'reorder_reminder':
        result = await predictiveReorderReminder(aiJob.payload);
        break;
      default:
        throw new Error(`Unknown job type: ${aiJob.type}`);
    }

    // 3. Generate versioned/hashed output
    const [oHash, pHash, cHash] = await Promise.all([
      hashOutput(result),
      hashPrompt(aiJob.type),
      hashContext(aiJob.payload)
    ]);

    // 4. Persist AI Output
    await supabaseAdmin.from('ai_outputs').insert({
      job_id: aiJob.id,
      output: result,
      output_hash: oHash,
      prompt_hash: pHash,
      context_hash: cHash,
      output_version: 1 // In a real scenario, we might increment this
    });

    // 5. Log Tracking Event
    await supabaseAdmin.from('tracking_events').insert({
      event_type: 'ai_job_execution_success',
      metadata: { job_id: aiJob.id, type: aiJob.type }
    });

    // 6. Publish Domain Event
    await supabaseAdmin.from('domain_events').insert({
      event_type: 'ai_job_completed',
      payload: { job_id: aiJob.id, type: aiJob.type, tenant_id: aiJob.tenant_id },
      tenant_id: aiJob.tenant_id
    });

    // 7. Mark as Completed
    await supabaseAdmin.from('ai_jobs').update({
      status: 'completed',
      updated_at: new Date().toISOString()
    }).eq('id', aiJob.id);

    return { ok: true, processed: 1, jobId: aiJob.id };

  } catch (err: any) {
    console.error(`Error processing job ${aiJob.id}:`, err);

    const isLastAttempt = aiJob.attempts >= aiJob.max_attempts;
    
    // Update status based on retry logic
    const updatePayload: any = {
      last_error: err.message,
      updated_at: new Date().toISOString(),
      attempts: aiJob.attempts + 1
    };

    if (isLastAttempt) {
      updatePayload.status = 'dead_letter';
      updatePayload.dead_letter_at = new Date().toISOString();
    } else {
      updatePayload.status = 'queued'; // Return to queue for retry
    }

    await supabaseAdmin.from('ai_jobs').update(updatePayload).eq('id', aiJob.id);

    // Publish Failure Event
    await supabaseAdmin.from('domain_events').insert({
      event_type: isLastAttempt ? 'ai_job_dead_letter' : 'ai_job_failed',
      payload: { job_id: aiJob.id, error: err.message },
      tenant_id: aiJob.tenant_id
    });

    return { ok: false, processed: 1, jobId: aiJob.id, error: err.message };
  }
}
