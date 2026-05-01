import { useMemo } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface SEOData {
  title?: string;
  metaDescription?: string;
  titleHi?: string;
  metaDescriptionHi?: string;
  content?: string;
  slug?: string;
  featuredImage?: string;
  targetKeyword?: string;
}

interface Check {
  label: string;
  passed: boolean;
  points: number;
  suggestion?: string;
}

function analyzeContent(data: SEOData): Check[] {
  const title = data.title || '';
  const meta = data.metaDescription || '';
  const content = data.content || '';
  const keyword = data.targetKeyword?.toLowerCase() || '';
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const firstParagraph = content.slice(0, 500).toLowerCase();

  return [
    {
      label: 'Title length (50–60 chars)',
      passed: title.length >= 50 && title.length <= 60,
      points: 15,
      suggestion: title.length < 50 ? `Add ${50 - title.length} more characters` : title.length > 60 ? `Remove ${title.length - 60} characters` : undefined,
    },
    {
      label: 'Meta description (120–160 chars)',
      passed: meta.length >= 120 && meta.length <= 160,
      points: 15,
      suggestion: meta.length === 0 ? 'Add a meta description to improve CTR' : meta.length < 120 ? `Add ${120 - meta.length} more characters` : meta.length > 160 ? `Remove ${meta.length - 160} characters` : undefined,
    },
    {
      label: 'Keyword in title',
      passed: keyword.length > 0 && title.toLowerCase().includes(keyword),
      points: 10,
      suggestion: keyword.length === 0 ? 'Set a target keyword' : 'Include the target keyword in your title',
    },
    {
      label: 'Keyword in first paragraph',
      passed: keyword.length > 0 && firstParagraph.includes(keyword),
      points: 10,
      suggestion: 'Mention the target keyword in the first paragraph',
    },
    {
      label: 'Article length > 300 words',
      passed: wordCount > 300,
      points: 10,
      suggestion: `Currently ${wordCount} words. Aim for 300+`,
    },
    {
      label: 'Has featured image',
      passed: !!data.featuredImage,
      points: 10,
      suggestion: 'Add a featured image with alt text',
    },
    {
      label: 'Slug matches title',
      passed: !!data.slug && data.slug.length > 5,
      points: 10,
      suggestion: 'Set a descriptive slug that matches your title',
    },
    {
      label: 'Hindi title provided',
      passed: !!data.titleHi && data.titleHi.length > 5,
      points: 10,
      suggestion: 'Add a Hindi title for bilingual SEO',
    },
    {
      label: 'Hindi meta description provided',
      passed: !!data.metaDescriptionHi && data.metaDescriptionHi.length > 20,
      points: 10,
      suggestion: 'Add a Hindi meta description',
    },
  ];
}

export function SEOScorePanel({ data }: { data: SEOData }) {
  const checks = useMemo(() => analyzeContent(data), [data]);
  const score = checks.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0);
  const maxScore = checks.reduce((sum, c) => sum + c.points, 0);

  const color = score >= 70 ? '#16A34A' : score >= 40 ? '#F59E0B' : '#DC2626';
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor';

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 16,
      background: '#fafafa',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Score circle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          border: `3px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', flexShrink: 0,
        }}>
          <span style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 8, color: '#9ca3af', fontWeight: 600 }}>/{maxScore}</span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>SEO Score</div>
          <div style={{ fontSize: 11, fontWeight: 600, color }}>{label}</div>
        </div>
      </div>

      {/* Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {checks.map((check) => (
          <div key={check.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            {check.passed ? (
              <CheckCircle2 style={{ width: 14, height: 14, color: '#16A34A', flexShrink: 0, marginTop: 1 }} />
            ) : (
              <XCircle style={{ width: 14, height: 14, color: '#DC2626', flexShrink: 0, marginTop: 1 }} />
            )}
            <div>
              <div style={{
                fontSize: 11, fontWeight: check.passed ? 500 : 600,
                color: check.passed ? '#6b7280' : '#111',
                textDecoration: check.passed ? 'none' : 'none',
              }}>
                {check.label}
                <span style={{ fontSize: 9, color: '#9ca3af', marginLeft: 4 }}>+{check.points}</span>
              </div>
              {!check.passed && check.suggestion && (
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{check.suggestion}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
