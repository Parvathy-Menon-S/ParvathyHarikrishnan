import { loadVersionConfig } from '@/lib/loadVersionConfig';
import { StageRenderer } from '@/components/StageRenderer';
import { ErrorUI } from '@/components/ErrorUI';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const params = await searchParams;
  const result = loadVersionConfig(params.v);

  if (!result.success) {
    return <ErrorUI error={result.error} />;
  }

  return <StageRenderer config={result.data} />;
}
