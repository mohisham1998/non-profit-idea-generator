import { useCallback } from 'react';
import { trpc } from '@/lib/trpc';

export function useImageStorage() {
  const { data: quota, refetch } = trpc.images.getQuota.useQuery();

  const refreshStorageQuota = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const formatBytes = (bytes: number) =>
    (bytes / (1024 * 1024 * 1024)).toFixed(2);

  return {
    usedBytes: quota?.usedBytes ?? 0,
    limitBytes: quota?.limitBytes ?? 10737418240,
    usedPercentage: quota?.usedPercentage ?? 0,
    formatBytes,
    refreshStorageQuota,
  };
}
