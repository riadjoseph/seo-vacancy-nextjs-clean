import { createClient } from '@/lib/supabase/client';
import type { Enums, TablesInsert, TablesUpdate } from '@/lib/supabase/types';
import { createJobSlug } from '@/utils/jobUtils';
import { JobFormData } from '@/utils/jobValidation';

export const submitJob = async (formData: JobFormData, jobId?: string): Promise<{ jobId: string; slug: string }> => {
  const supabase = createClient();

  // Calculate expiration date
  const startDate = new Date(formData.start_date);
  const expirationDate = new Date(startDate);
  expirationDate.setDate(startDate.getDate() + parseInt(formData.duration));

  const { ...jobDataWithoutDuration } = formData;

  // Generate slug
  const slug = createJobSlug(formData.title, formData.company_name, formData.city || 'remote');

  const jobData = {
    ...jobDataWithoutDuration,
    // Cast tag labels to the Supabase enum type
    tags: formData.tags as Enums<'seo_specialization'>[],
    salary_min: formData.hide_salary || !formData.salary_min ? null : parseFloat(formData.salary_min) || null,
    salary_max: formData.hide_salary || !formData.salary_max ? null : parseFloat(formData.salary_max) || null,
    faq: formData.faq?.trim() || null,
    company_info: formData.company_info?.trim() || null,
    start_date: startDate.toISOString(),
    expires_at: expirationDate.toISOString(),
    user_id: (await supabase.auth.getUser()).data.user?.id,
    slug: slug,
  };

  if (jobId) {
    // Update existing job
    const { error } = await supabase
      .from('jobs')
      .update(jobData as TablesUpdate<'jobs'>)
      .eq('id', jobId);
    if (error) throw error;

    return { jobId, slug };
  } else {
    // Insert new job
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData as TablesInsert<'jobs'>)
      .select('id')
      .single();
    if (error) throw error;

    return { jobId: data.id, slug };
  }
};

export const deleteJob = async (jobId: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('jobs').delete().eq('id', jobId);

  if (error) throw error;
};
