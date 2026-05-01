/**
 * Pre-defined content templates for common article types.
 * Each template pre-fills: title format, category, excerpt, and Tiptap content structure.
 */

export interface ContentTemplate {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  titleFormat: { en: string; hi: string };
  excerptFormat: { en: string; hi: string };
  contentStructure: string; // HTML template for Tiptap editor
}

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: 'event-coverage',
    name: 'Event Coverage',
    nameHi: 'कार्यक्रम कवरेज',
    category: 'events',
    titleFormat: {
      en: 'ABHM UP [Event Name] held at [Location] on [Date]',
      hi: 'ABHM UP [कार्यक्रम का नाम] [स्थान] पर [तिथि] को आयोजित',
    },
    excerptFormat: {
      en: 'The [event name] was organized by ABHM UP on [date] at [location], attended by [number] members from across the state.',
      hi: '[कार्यक्रम का नाम] ABHM UP द्वारा [तिथि] को [स्थान] पर आयोजित किया गया, जिसमें राज्य भर से [संख्या] सदस्यों ने भाग लिया।',
    },
    contentStructure: `
<h2>Event Overview</h2>
<p>The [event name] was held on [date] at [venue, city]. The program was organized under the leadership of [organizer name], State President, ABHM UP.</p>

<h2>Key Highlights</h2>
<ul>
  <li>[Highlight 1 — keynote speech or main address]</li>
  <li>[Highlight 2 — resolutions passed]</li>
  <li>[Highlight 3 — special guests or dignitaries]</li>
</ul>

<h2>Speakers & Dignitaries</h2>
<p>[List of speakers with their designations and key points from their addresses]</p>

<h2>Resolutions Passed</h2>
<ol>
  <li>[Resolution 1]</li>
  <li>[Resolution 2]</li>
</ol>

<h2>Attendance & Participation</h2>
<p>The event was attended by approximately [number] members from [number] districts. District presidents and mandal representatives were present from across Uttar Pradesh.</p>

<p><em>— ABHM UP Media Cell, [City]</em></p>
    `.trim(),
  },
  {
    id: 'press-release',
    name: 'Press Release',
    nameHi: 'प्रेस विज्ञप्ति',
    category: 'press',
    titleFormat: {
      en: 'Press Release: [Subject] — ABHM UP',
      hi: 'प्रेस विज्ञप्ति: [विषय] — ABHM UP',
    },
    excerptFormat: {
      en: 'Official statement from Akhil Bharat Hindu Mahasabha, Uttar Pradesh regarding [subject].',
      hi: '[विषय] के संबंध में अखिल भारत हिन्दू महासभा, उत्तर प्रदेश का आधिकारिक बयान।',
    },
    contentStructure: `
<p><strong>FOR IMMEDIATE RELEASE</strong></p>
<p><strong>Date:</strong> [Date]</p>
<p><strong>Contact:</strong> ABHM UP Media Cell</p>

<h2>[Headline]</h2>

<p><strong>Lucknow, Uttar Pradesh —</strong> [Opening paragraph: who, what, when, where, why. State the core message in 2-3 sentences.]</p>

<p>[Second paragraph: supporting details, context, and background information.]</p>

<blockquote>
<p>"[Direct quote from State President or spokesperson]"</p>
<p>— [Name], [Designation], ABHM UP</p>
</blockquote>

<p>[Third paragraph: implications, next steps, or call to action.]</p>

<h2>About ABHM UP</h2>
<p>The Akhil Bharat Hindu Mahasabha, Uttar Pradesh unit, is a historic political organization founded in 1915, dedicated to cultural preservation and national service across all 75 districts of Uttar Pradesh.</p>

<p><strong>###</strong></p>
    `.trim(),
  },
  {
    id: 'cultural-program',
    name: 'Cultural Program',
    nameHi: 'सांस्कृतिक कार्यक्रम',
    category: 'culture',
    titleFormat: {
      en: '[Festival/Occasion] celebrated by ABHM UP at [Location]',
      hi: 'ABHM UP द्वारा [त्योहार/अवसर] [स्थान] पर मनाया गया',
    },
    excerptFormat: {
      en: 'ABHM UP celebrated [occasion] with cultural performances, puja, and community gathering at [location].',
      hi: 'ABHM UP ने [अवसर] [स्थान] पर सांस्कृतिक कार्यक्रमों, पूजा और सामुदायिक सभा के साथ मनाया।',
    },
    contentStructure: `
<h2>Celebration of [Festival/Occasion]</h2>
<p>On [date], ABHM UP organized a grand celebration of [festival name] at [venue, city]. The event brought together members and supporters from [number] districts.</p>

<h2>Program Schedule</h2>
<ol>
  <li><strong>Morning:</strong> [Puja / Havan details]</li>
  <li><strong>Afternoon:</strong> [Cultural performances, bhajans, speeches]</li>
  <li><strong>Evening:</strong> [Community dinner / closing ceremony]</li>
</ol>

<h2>Cultural Performances</h2>
<p>[Description of performances, artists, and highlights]</p>

<h2>Community Impact</h2>
<p>[How the event strengthened community bonds, any charitable activities]</p>
    `.trim(),
  },
  {
    id: 'gau-raksha',
    name: 'Gau Raksha Report',
    nameHi: 'गौ रक्षा रिपोर्ट',
    category: 'gaushala',
    titleFormat: {
      en: 'Gau Raksha: [Action] in [District] — ABHM UP',
      hi: 'गौ रक्षा: [जिला] में [कार्रवाई] — ABHM UP',
    },
    excerptFormat: {
      en: 'ABHM UP conducted [action] for cow protection in [district], rescuing [number] cows and strengthening gaushala operations.',
      hi: 'ABHM UP ने [जिला] में गौ संरक्षण के लिए [कार्रवाई] की, [संख्या] गायों को बचाया और गौशाला संचालन को मजबूत किया।',
    },
    contentStructure: `
<h2>Report: [Title]</h2>
<p><strong>District:</strong> [District Name]<br/>
<strong>Date:</strong> [Date]<br/>
<strong>Team:</strong> [Team leader name and members]</p>

<h2>Situation</h2>
<p>[Description of the situation that triggered the action]</p>

<h2>Action Taken</h2>
<ul>
  <li>[Action 1 — rescue operation details]</li>
  <li>[Action 2 — coordination with authorities]</li>
  <li>[Action 3 — gaushala placement]</li>
</ul>

<h2>Outcome</h2>
<p><strong>Cows rescued:</strong> [number]<br/>
<strong>Current status:</strong> [Sheltered at [gaushala name] / Under medical care]<br/>
<strong>FIR filed:</strong> [Yes/No — details]</p>

<h2>Follow-up</h2>
<p>[Planned follow-up actions, ongoing monitoring]</p>
    `.trim(),
  },
  {
    id: 'leadership-statement',
    name: 'Leadership Statement',
    nameHi: 'नेतृत्व वक्तव्य',
    category: 'statement',
    titleFormat: {
      en: '[Leader Name] on [Topic]: Official Statement — ABHM UP',
      hi: '[नेता का नाम] [विषय] पर: आधिकारिक बयान — ABHM UP',
    },
    excerptFormat: {
      en: '[Leader designation] [Leader name] issued an official statement regarding [topic], calling for [action/position].',
      hi: '[पदनाम] [नेता का नाम] ने [विषय] पर आधिकारिक बयान जारी किया, [कार्रवाई/स्थिति] का आह्वान किया।',
    },
    contentStructure: `
<p><strong>[Full name]</strong><br/>
<em>[Designation], Akhil Bharat Hindu Mahasabha, Uttar Pradesh</em></p>

<h2>Statement on [Topic]</h2>

<blockquote>
<p>"[Main quote — the core message of the statement in the leader's own words. This should be 2-4 sentences that capture the key position.]"</p>
</blockquote>

<p>[Context paragraph: background on the issue, why the statement is being made now.]</p>

<p>[Position paragraph: detailed explanation of ABHM UP's stance on the matter.]</p>

<p>[Action paragraph: what steps ABHM UP plans to take, any demands or requests.]</p>

<p><em>Issued on [Date] from [Location]</em></p>
    `.trim(),
  },
];

/**
 * Get a template by ID.
 */
export function getTemplate(id: string): ContentTemplate | undefined {
  return CONTENT_TEMPLATES.find((t) => t.id === id);
}
