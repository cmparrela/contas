'use client';

import { useTags } from '@/lib/hooks/use-tags';

export function TagChips({ tagIds }: { tagIds?: string[] }) {
  const { data: tags } = useTags();

  if (!tagIds || tagIds.length === 0) return null;

  const resolved = tagIds
    .map((id) => tags?.find((tag) => tag._id === id))
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));

  if (resolved.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {resolved.map((tag) => (
        <span
          key={tag._id}
          className="badge"
          style={{ backgroundColor: `${tag.color}1A`, color: tag.color }}
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}
