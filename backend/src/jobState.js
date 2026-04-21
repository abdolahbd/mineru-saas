export const jobsMemory = new Map();

export function setJobState(jobId, data) {
  jobsMemory.set(jobId, {
    ...(jobsMemory.get(jobId) || {}),
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export function getJobState(jobId) {
  return jobsMemory.get(jobId);
}
