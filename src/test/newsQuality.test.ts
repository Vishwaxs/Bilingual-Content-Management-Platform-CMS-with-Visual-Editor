import { describe, expect, it } from 'vitest';
import { buildNewsQualityReport, type NewsQualityInput } from '@/lib/cms/newsQuality';

/**
 * Unit coverage for the news SEO quality scorer that powers the
 * admin NewsEditor / SEOScorePanel. This module had no test coverage,
 * so these tests pin down the scoring math, the pass/fail thresholds
 * for each check, and the publish-blocker logic.
 */

// A fully-compliant article that should pass every check (score 100).
const perfectInput: NewsQualityInput = {
  title_en: 'District Committee Announces New Membership Drive Across UP',
  body_en: 'x'.repeat(600),
  slug: 'district-committee-membership-drive',
  meta_title_en: 'District Committee Membership Drive Announced',
  meta_description_en:
    'The district committee has announced a statewide membership drive with new registration camps opening across every district in Uttar Pradesh this month.',
  featured_image: 'https://example.org/cover.jpg',
};

describe('buildNewsQualityReport', () => {
  it('awards a perfect score when every check passes', () => {
    const report = buildNewsQualityReport(perfectInput);
    expect(report.score).toBe(100);
    expect(report.checks.every((check) => check.passed)).toBe(true);
    expect(report.blockers).toEqual([]);
  });

  it('returns one check per quality dimension', () => {
    const report = buildNewsQualityReport(perfectInput);
    expect(report.checks.map((c) => c.id).sort()).toEqual(
      [
        'body-depth',
        'featured-image',
        'meta-description',
        'meta-title',
        'slug-readability',
        'title-length',
      ].sort(),
    );
  });

  it('weights sum to 100 so the score is a true percentage', () => {
    const report = buildNewsQualityReport(perfectInput);
    const totalWeight = report.checks.reduce((sum, c) => sum + c.weight, 0);
    expect(totalWeight).toBe(100);
  });

  it('scores zero when nothing passes', () => {
    const report = buildNewsQualityReport({
      title_en: '',
      body_en: '',
      slug: '',
    });
    expect(report.score).toBe(0);
    expect(report.checks.every((check) => !check.passed)).toBe(true);
  });

  it('rounds the score to the nearest whole percent', () => {
    // Only the featured-image check (weight 12) passes → 12/100 = 12.
    const report = buildNewsQualityReport({
      title_en: 'short',
      body_en: 'short',
      slug: '!!',
      featured_image: 'https://example.org/cover.jpg',
    });
    expect(report.score).toBe(12);
    expect(Number.isInteger(report.score)).toBe(true);
  });

  describe('title-length check', () => {
    const titleCheck = (title: string) =>
      buildNewsQualityReport({ ...perfectInput, title_en: title }).checks.find(
        (c) => c.id === 'title-length',
      )!;

    it('fails when shorter than 30 characters', () => {
      expect(titleCheck('a'.repeat(29)).passed).toBe(false);
    });

    it('passes at the 30-character lower bound', () => {
      expect(titleCheck('a'.repeat(30)).passed).toBe(true);
    });

    it('passes at the 90-character upper bound', () => {
      expect(titleCheck('a'.repeat(90)).passed).toBe(true);
    });

    it('fails when longer than 90 characters', () => {
      expect(titleCheck('a'.repeat(91)).passed).toBe(false);
    });

    it('measures the trimmed title, ignoring surrounding whitespace', () => {
      expect(titleCheck(`   ${'a'.repeat(20)}   `).passed).toBe(false);
    });
  });

  describe('body-depth check', () => {
    const bodyCheck = (body: string) =>
      buildNewsQualityReport({ ...perfectInput, body_en: body }).checks.find(
        (c) => c.id === 'body-depth',
      )!;

    it('fails below 300 characters', () => {
      expect(bodyCheck('x'.repeat(299)).passed).toBe(false);
    });

    it('passes at exactly 300 characters', () => {
      expect(bodyCheck('x'.repeat(300)).passed).toBe(true);
    });
  });

  describe('slug-readability check', () => {
    const slugCheck = (slug: string) =>
      buildNewsQualityReport({ ...perfectInput, slug }).checks.find(
        (c) => c.id === 'slug-readability',
      )!;

    it('accepts lowercase alphanumeric slugs with hyphens', () => {
      expect(slugCheck('valid-slug-123').passed).toBe(true);
    });

    it('rejects uppercase characters', () => {
      expect(slugCheck('Invalid-Slug').passed).toBe(false);
    });

    it('rejects slugs shorter than 3 characters', () => {
      expect(slugCheck('ab').passed).toBe(false);
    });

    it('rejects slugs containing spaces or symbols', () => {
      expect(slugCheck('bad slug!').passed).toBe(false);
    });
  });

  describe('meta-title check', () => {
    const metaTitleCheck = (meta_title_en?: string) =>
      buildNewsQualityReport({ ...perfectInput, meta_title_en }).checks.find(
        (c) => c.id === 'meta-title',
      )!;

    it('fails when the meta title is omitted', () => {
      expect(metaTitleCheck(undefined).passed).toBe(false);
    });

    it('fails below 20 characters', () => {
      expect(metaTitleCheck('a'.repeat(19)).passed).toBe(false);
    });

    it('passes within the 20-70 character band', () => {
      expect(metaTitleCheck('a'.repeat(45)).passed).toBe(true);
    });

    it('fails above 70 characters', () => {
      expect(metaTitleCheck('a'.repeat(71)).passed).toBe(false);
    });
  });

  describe('meta-description check', () => {
    const metaDescCheck = (meta_description_en?: string) =>
      buildNewsQualityReport({ ...perfectInput, meta_description_en }).checks.find(
        (c) => c.id === 'meta-description',
      )!;

    it('fails below 120 characters', () => {
      expect(metaDescCheck('a'.repeat(119)).passed).toBe(false);
    });

    it('passes within the 120-170 character band', () => {
      expect(metaDescCheck('a'.repeat(150)).passed).toBe(true);
    });

    it('fails above 170 characters', () => {
      expect(metaDescCheck('a'.repeat(171)).passed).toBe(false);
    });
  });

  describe('featured-image check', () => {
    it('fails when no image is provided', () => {
      const report = buildNewsQualityReport({ ...perfectInput, featured_image: '' });
      expect(report.checks.find((c) => c.id === 'featured-image')!.passed).toBe(false);
    });

    it('passes when any non-empty image value is provided', () => {
      const report = buildNewsQualityReport({
        ...perfectInput,
        featured_image: 'https://example.org/cover.jpg',
      });
      expect(report.checks.find((c) => c.id === 'featured-image')!.passed).toBe(true);
    });

    it('treats a whitespace-only image value as missing', () => {
      const report = buildNewsQualityReport({ ...perfectInput, featured_image: '   ' });
      expect(report.checks.find((c) => c.id === 'featured-image')!.passed).toBe(false);
    });
  });

  describe('publish blockers', () => {
    it('reports no blockers for a compliant article', () => {
      expect(buildNewsQualityReport(perfectInput).blockers).toEqual([]);
    });

    it('lists only the three hard-gate checks as blockers, never the SEO extras', () => {
      // Everything empty: all six checks fail, but only title/body/slug block publishing.
      const report = buildNewsQualityReport({ title_en: '', body_en: '', slug: '' });
      expect(report.blockers).toEqual(['Title quality', 'Body depth', 'Slug validity']);
    });

    it('does not block on missing SEO meta or image alone', () => {
      const report = buildNewsQualityReport({
        title_en: 'a'.repeat(40),
        body_en: 'x'.repeat(400),
        slug: 'a-valid-slug',
        // meta + image omitted → those checks fail but must not block.
      });
      expect(report.blockers).toEqual([]);
      expect(report.score).toBeLessThan(100);
    });
  });
});
