export function formatCategoryName(cat?: string | null): string {
  if (!cat) return '';
  if (cat === 'All Posts') return cat;
  
  return cat
    .split(' ')
    .map(word => {
      const lower = word.toLowerCase();
      if (lower === 'ai') return 'AI';
      if (lower === 'ml') return 'ML';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
