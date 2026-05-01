export type NewsQualityInput = {
  title_en: string;
  body_en: string;
  slug: string;
  meta_title_en?: string;
  meta_description_en?: string;
  featured_image?: string;
};

export type NewsQualityCheck = {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  detail: string;
};

export type NewsQualityReport = {
  score: number;
  checks: NewsQualityCheck[];
  blockers: string[];
};

const scoreFromChecks = (checks: NewsQualityCheck[]) => {
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  if (!totalWeight) return 0;
  const earned = checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0);
  return Math.round((earned / totalWeight) * 100);
};

export const buildNewsQualityReport = (input: NewsQualityInput): NewsQualityReport => {
  const title = input.title_en.trim();
  const body = input.body_en.trim();
  const slug = input.slug.trim();
  const metaTitle = (input.meta_title_en ?? '').trim();
  const metaDescription = (input.meta_description_en ?? '').trim();
  const featuredImage = (input.featured_image ?? '').trim();

  const checks: NewsQualityCheck[] = [
    {
      id: 'title-length',
      label: 'Title quality',
      passed: title.length >= 30 && title.length <= 90,
      weight: 18,
      detail: 'Keep title between 30-90 characters for clear SERP headlines.',
    },
    {
      id: 'body-depth',
      label: 'Body depth',
      passed: body.length >= 300,
      weight: 22,
      detail: 'Published content should have at least 300 characters in body.',
    },
    {
      id: 'slug-readability',
      label: 'Slug validity',
      passed: /^[a-z0-9-]{3,120}$/.test(slug),
      weight: 18,
      detail: 'Use lowercase slug with numbers and hyphens only.',
    },
    {
      id: 'meta-title',
      label: 'SEO meta title',
      passed: metaTitle.length >= 20 && metaTitle.length <= 70,
      weight: 15,
      detail: 'Meta title should be 20-70 characters.',
    },
    {
      id: 'meta-description',
      label: 'SEO meta description',
      passed: metaDescription.length >= 120 && metaDescription.length <= 170,
      weight: 15,
      detail: 'Meta description should be 120-170 characters.',
    },
    {
      id: 'featured-image',
      label: 'Featured image',
      passed: featuredImage.length > 0,
      weight: 12,
      detail: 'Add a featured image URL for visual consistency.',
    },
  ];

  const blockers = checks
    .filter((check) => ['title-length', 'body-depth', 'slug-readability'].includes(check.id) && !check.passed)
    .map((check) => check.label);

  return {
    score: scoreFromChecks(checks),
    checks,
    blockers,
  };
};