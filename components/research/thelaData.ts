// Everything on the Thela Thaila Thikana research page comes from the project's research document.

// ── 01 Market at a glance ─────────────────────────────────────────
export const MARKET_STATS = [
  { id: 'opened', value: '1970s', label: 'Opened', note: 'Among the first hangout spots in west Ahmedabad, especially in the 1980s.' },
  { id: 'shops', value: 49, label: 'Small shops', note: 'Shops sit on the north, east and south sides of a central courtyard used for parking.' },
  { id: 'area', value: 7000, unit: 'm²', label: 'Market area', note: 'Next to one of Ahmedabad’s busiest streets, C.G. Road in Navrangpura.' },
] as const;

// ── 02 Interview themes (ranked by how often they came up) ───────
export interface Theme {
  id: string;
  rank: number;
  name: string;
  tone: 'steady' | 'concerned';
  voices: { who: string; note: string }[];
}

export const THEMES: Theme[] = [
  {
    id: 'longevity', rank: 1, name: 'Longevity and continuity', tone: 'steady',
    voices: [
      { who: 'Bhupendra Shah', note: 'Has been part of the market since 1976, and has owned ‘Cheers’ since 1980.' },
      { who: 'Neel, coconut vendor', note: 'Has served customers for 50 years.' },
      { who: 'Kuldeep Yadav', note: 'Has run a tea stall near the temple for about 50 years.' },
    ],
  },
  {
    id: 'satisfaction', rank: 2, name: 'Satisfaction and contentment', tone: 'steady',
    voices: [
      { who: 'Vinodbhai', note: 'Has no issues with how the market runs or how clean it is.' },
      { who: 'Monika', note: 'Feels deeply safe and satisfied, especially as a woman, even late at night.' },
      { who: 'Ansar', note: 'Likes the market as it is and fears changes might disrupt its essence.' },
    ],
  },
  {
    id: 'disappointment', rank: 3, name: 'Disappointment and concern', tone: 'concerned',
    voices: [
      { who: 'Krishna and Laxmanbhai', note: 'Point to unhygienic washrooms and inadequate facilities for women.' },
      { who: 'Ravi Kumar, AMC sweeper', note: 'Struggles with wages that don’t cover basic needs.' },
      { who: 'Raju', note: 'Fears for the market’s survival as branded stores compete.' },
    ],
  },
  {
    id: 'hope', rank: 4, name: 'Hope and optimism', tone: 'steady',
    voices: [
      { who: 'Manushree', note: 'Imagines a transformed market in the next decade, with better parking and new stores to attract customers.' },
      { who: 'Monika', note: 'Suggests revamping outdated shops to meet today’s needs, such as more grocery stores.' },
    ],
  },
  {
    id: 'nostalgia', rank: 5, name: 'Nostalgia and sentimentality', tone: 'steady',
    voices: [
      { who: 'Monika', note: 'Remembers childhood visits, with the market as the backdrop to countless memories.' },
      { who: 'Manushree', note: 'Recalls the market as a safe haven in her youth, full of warmth and familiarity.' },
    ],
  },
  {
    id: 'adaptation', rank: 6, name: 'Adaptation and resilience', tone: 'steady',
    voices: [
      { who: 'Vinodbhai', note: 'He and his family keep their toy-selling business thriving despite obstacles.' },
      { who: 'Ansar, larry owner', note: 'Stays steadfast and keeps his business going despite worries about change.' },
    ],
  },
  {
    id: 'declining', rank: 7, name: 'Concern over declining patronage', tone: 'concerned',
    voices: [
      { who: 'Neel', note: 'Sees fewer visitors and puts it down to growing competition.' },
      { who: 'Raju', note: 'Notices business slowing and worries about the market’s future against modern competitors.' },
    ],
  },
];

// ── 03 Personas ───────────────────────────────────────────────────
export const PERSONAS = [
  {
    id: 'monika', name: 'Monika', role: 'Local resident', img: '/research/thela/persona-monika.jpg',
    mapKey: 'Residential community', quadrant: 'Monitor',
    carries: ['Pani puri', 'Shopping bags', 'Ice cream', 'A house nearby'],
    research: 'Speaks in the interviews about feeling safe, childhood memories, and what she’d like to see change.',
  },
  {
    id: 'naresh', name: 'Naresh', role: 'Vendor', img: '/research/thela/persona-naresh.jpg',
    mapKey: 'Street vendors', quadrant: 'Manage closely',
    carries: ['Water bottle', 'Leather belt', 'Punch pliers', 'A family photo'],
    research: 'Shadowed for an evening, selling leather belts on the pavement of C.G. Road with Vani.',
  },
  {
    id: 'karan', name: 'Karan', role: 'Consumer', img: '/research/thela/persona-karan.jpg',
    mapKey: 'Customer', quadrant: 'Keep informed',
    carries: ['Briefcase', 'Tiffin', 'Scooter', 'The market around him'],
    research: null,
  },
  {
    id: 'rahul', name: 'Rahul', role: 'Zomato delivery worker', img: '/research/thela/persona-rahul.jpg',
    mapKey: 'Delivery agents', quadrant: 'Invisible stakeholder',
    carries: ['Wallet', 'QR code', 'Location pin', 'Delivery bag'],
    research: null,
  },
  {
    id: 'bilal', name: 'Bilal', role: 'Rickshaw driver', img: '/research/thela/persona-bilal.jpg',
    mapKey: 'Auto Driver', quadrant: 'Keep informed',
    carries: ['Chillies and lemon charm', 'Wallet', 'A small deity figure', 'His auto-rickshaw'],
    research: null,
  },
] as const;

// ── 04 Stakeholder map (positions read off the power–interest graph, 0–100 each way) ─
export type Quadrant = 'Manage closely' | 'Keep satisfied' | 'Keep informed' | 'Monitor';

export const QUADRANT_NOTES: Record<Quadrant, string> = {
  'Manage closely': 'High power, high interest.',
  'Keep satisfied': 'High power, lower interest.',
  'Keep informed': 'Lower power, high interest.',
  Monitor: 'Lower power, lower interest.',
};

// `extra` marks the stakeholders that are on the lists below but not on the document's own power–interest graph. They are placed
// by judgement (the same way as the others, relative to their neighbours in the box) and drawn as hollow dashed dots.
export const STAKEHOLDERS: { name: string; x: number; y: number; q: Quadrant; extra?: boolean }[] = [
  // x is interest (0 = none, 100 = most), y is power measured from the top (0 = most, 100 = least). The quadrants are the
  // research document's and do not change; inside each one a stakeholder sits by how much power and interest it has
  // relative to the others in that box.
  // Keep satisfied: high power, low interest. AMC licenses, plans the renovations and sweeps, so it holds more power than
  // the police, and cares a little more about how the market runs.
  { name: 'AMC (municipal corporation)', x: 34, y: 14, q: 'Keep satisfied' },
  { name: 'Police', x: 15, y: 31, q: 'Keep satisfied' },
  // Manage closely: high power, high interest. Shop owners hold the leases and the association; the restaurant owner and
  // the food business have capital but also other options; street vendors and the fruit seller depend on the market
  // every day (most interest) but hold little formal power.
  { name: 'Shop owners', x: 84, y: 15, q: 'Manage closely' },
  { name: 'Restaurant service (owner)', x: 68, y: 22, q: 'Manage closely' },
  { name: 'Food business (owners)', x: 76, y: 30, q: 'Manage closely' },
  { name: 'Street vendors', x: 93, y: 39, q: 'Manage closely' },
  { name: 'Fruit seller', x: 83, y: 46, q: 'Manage closely' },
  // Monitor: low power, low interest.
  { name: 'Residential community', x: 30, y: 68, q: 'Monitor' },
  // Keep informed: low power, high interest. A manager has a little authority and a waiter or sweeper almost none; street
  // vendors and the tea stall owner are in it for their livelihood (most interest); customers and auto drivers can go
  // elsewhere, so they care least.
  { name: 'Restaurant service (manager)', x: 68, y: 57, q: 'Keep informed' },
  { name: 'Food business (workers)', x: 83, y: 60, q: 'Keep informed' },
  { name: 'Tea Stall Owner', x: 90, y: 68, q: 'Keep informed' },
  { name: 'AMC Sweeper', x: 62, y: 73, q: 'Keep informed' },
  { name: 'Street Vendor', x: 94, y: 77, q: 'Keep informed' },
  { name: 'Restaurant service (waiter)', x: 75, y: 82, q: 'Keep informed' },
  { name: 'Auto Driver', x: 58, y: 87, q: 'Keep informed' },
  { name: 'Customer', x: 68, y: 93, q: 'Keep informed' },
  // On the lists but not on the graph in the document: placed by judgement.
  { name: 'Market association', x: 58, y: 12, q: 'Manage closely', extra: true },       // runs the shops' side of things: high power, high interest
  { name: 'Police officials', x: 8, y: 41, q: 'Keep satisfied', extra: true },          // the officers on site (visible list); "Police" on the graph is the invisible-list entry
  { name: 'Online marketplaces & malls', x: 27, y: 44, q: 'Keep satisfied', extra: true }, // indirect competitors: some pull on the market, little interest in it
  { name: 'Event organisers', x: 44, y: 36, q: 'Keep satisfied', extra: true },          // can bring a crowd (or take space) when they choose
  { name: 'Temple', x: 12, y: 62, q: 'Monitor', extra: true },                            // a neighbour with footfall of its own
  { name: 'Bus stop', x: 44, y: 82, q: 'Monitor', extra: true },
  { name: 'Delivery agents', x: 18, y: 84, q: 'Monitor', extra: true },
  { name: 'Waste collectors', x: 77, y: 70, q: 'Keep informed', extra: true },           // rely on what the market throws away, every day
];

// Which dots on the map stand for each name on the two lists, so hovering a name lights its dots.
export const LIST_DOTS: Record<string, string[]> = {
  'Vendors and shop owners': ['Shop owners', 'Street vendors'],
  'Street hawkers and small-scale owners': ['Street Vendor', 'Fruit seller'],
  'Consumers (shoppers and visitors)': ['Customer'],
  'Market association / committee members': ['Market association'],
  'Police officials': ['Police officials'],
  'Municipal staff (AMC): sanitation and maintenance workers': ['AMC Sweeper'],
  'Auto-rickshaw and cab drivers': ['Auto Driver'],
  'Local residents': ['Residential community'],
  'Nearby business owners and workers': ['Restaurant service (owner)', 'Restaurant service (manager)', 'Restaurant service (waiter)', 'Food business (owners)', 'Food business (workers)'],
  'Government and municipal authorities': ['AMC (municipal corporation)'],
  'Waste collectors and recycling workers': ['Waste collectors'],
  'Online marketplaces and malls (indirect competitors)': ['Online marketplaces & malls'],
  'Bus stop': ['Bus stop'],
  'Delivery agents (Zomato, Swiggy)': ['Delivery agents'],
  'Event organisers': ['Event organisers'],
  'Police': ['Police'],
  'Temple': ['Temple'],
};

export const VISIBLE_STAKEHOLDERS = [
  'Vendors and shop owners', 'Street hawkers and small-scale owners', 'Consumers (shoppers and visitors)',
  'Market association / committee members', 'Police officials', 'Municipal staff (AMC): sanitation and maintenance workers',
];

export const INVISIBLE_STAKEHOLDERS = [
  'Auto-rickshaw and cab drivers', 'Local residents', 'Nearby business owners and workers', 'Government and municipal authorities',
  'Waste collectors and recycling workers', 'Online marketplaces and malls (indirect competitors)', 'Bus stop',
  'Delivery agents (Zomato, Swiggy)', 'Event organisers', 'Police', 'Temple',
];

// The dots on the map that stand for an invisible stakeholder (drawn hollow); every other dot is a visible stakeholder.
export const INVISIBLE_DOT_NAMES: ReadonlySet<string> = (() => {
  const visible = new Set(VISIBLE_STAKEHOLDERS.flatMap((n) => LIST_DOTS[n] ?? []));
  return new Set(INVISIBLE_STAKEHOLDERS.flatMap((n) => LIST_DOTS[n] ?? []).filter((d) => !visible.has(d)));
})();

// ── 05 A day in the life of a vendor (Valiben, toy stall) ────────
export type DayKind = 'home' | 'sourcing' | 'rest' | 'stall';

export const DAY_STEPS: { from: number; to: number; text: string; kind: DayKind; evidence?: boolean }[] = [
  { from: 6, to: 8, kind: 'home', text: 'Valiben wakes up and starts her day by getting water from the local tank for household use, then begins her household chores.' },
  { from: 8, to: 12, kind: 'home', text: 'She wakes her kids and gets them ready for school, then completes the remaining chores.' },
  { from: 12, to: 13, kind: 'home', text: 'She prepares lunch for her family with her sister.' },
  { from: 13, to: 14, kind: 'sourcing', text: 'She checks her stock for the stall. If it’s low, she goes with her husband to Kalupur market to buy toys and materials.' },
  { from: 14, to: 15, kind: 'home', text: 'She takes a break after coming back, eats lunch, then completes her final chores.' },
  { from: 15, to: 16, kind: 'rest', text: 'She sleeps for about an hour to recharge before heading to the market.' },
  { from: 16, to: 17, kind: 'stall', text: 'She packs up her stall items and walks to the stall area, ready to set up at 5.' },
  { from: 17, to: 20, kind: 'stall', evidence: true, text: 'She sets up her roadside stall with family members, cleans the nearby area to avoid getting fined, and makes sure the stall isn’t blocking the sidewalk for pedestrians.' },
  { from: 20, to: 24, kind: 'stall', text: 'They ask visitors to provide dinner for them, or else they go back home with an empty stomach after packing everything up.' },
];

export const DAY_KINDS: Record<DayKind, { label: string }> = {
  home: { label: 'Home and family' },
  sourcing: { label: 'Sourcing stock' },
  rest: { label: 'Rest' },
  stall: { label: 'At the stall' },
};

// ── 06 Shadowing Naresh and Vani ──────────────────────────────────
export const SHADOW_BEATS: { id: string; title: string; text: string; at: number | null }[] = [
  { id: 'spot', title: '30 years at the same spot', at: null, text: 'Naresh and Vani have been selling leather belts on the pavement of C.G. Road for over three decades. Their stall is simple, but it reflects years of hard work and familiarity with the market.' },
  { id: 'clock', title: 'They follow their own clock', at: 0.16, text: 'Their day starts based on how much they earned the day before. If sales were good, they come early. If not, they wait until the evening. On the day I spent with them, they arrived around 4:30 PM and were ready by 5:15.' },
  { id: 'setup', title: 'Setting up is second nature', at: 0.33, text: 'They know exactly where to place each belt and how to arrange everything quickly. You can tell they’ve done this hundreds of times.' },
  { id: 'bargain', title: 'Bargaining is part of the job', at: 0.5, text: 'Most customers expect to bargain, and Naresh and Vani handle it calmly. They often lower the price, not because the belts aren’t worth it, but because every sale helps meet daily needs.' },
  { id: 'together', title: 'They’re not alone in this', at: 0.58, text: 'When Naresh had trouble with a UPI payment, a nearby vendor came to help without hesitation. There’s a quiet sense of community in the market: people look out for one another.' },
  { id: 'uncertainty', title: 'But there’s a lot of uncertainty', at: 0.68, text: 'They aren’t sure their licence is valid. Rules keep changing, and that adds stress. Competition is tough too, especially when other belt sellers are just a few steps away.' },
  { id: 'late', title: 'They don’t leave early', at: 0.9, text: 'Even after sunset, they stay at their stall, hoping for just one more customer. That last sale means a lot.' },
  { id: 'strength', title: 'Everyday survival with quiet strength', at: 1, text: 'Spending time with them showed how much effort goes into their work. They keep going with patience, flexibility, and a strong connection to the place they call their workplace.' },
];

// ── 07 Card sorting ───────────────────────────────────────────────
export const SORT_ISSUES = ['Unsanitary washrooms', 'Unorganised vendors', 'Waste management', 'Overcrowding', 'Parking problem'] as const;

// Each vendor's order of priority (first = most important), as recorded in the card sort.
export const SORT_VENDORS: { name: string; who: string; order: (typeof SORT_ISSUES[number])[] }[] = [
  { name: 'Suresh', who: 'Manager, Momoman', order: ['Unsanitary washrooms', 'Unorganised vendors', 'Waste management', 'Overcrowding', 'Parking problem'] },
  { name: 'Manish', who: 'Waffle maker', order: ['Unsanitary washrooms', 'Waste management', 'Unorganised vendors', 'Overcrowding', 'Parking problem'] },
  { name: 'Mahesh', who: 'Co-owner, Kenzeers', order: ['Unsanitary washrooms', 'Unorganised vendors', 'Parking problem', 'Waste management', 'Overcrowding'] },
  { name: 'Ravi', who: 'Sevpuri seller', order: ['Unsanitary washrooms', 'Waste management', 'Overcrowding', 'Parking problem', 'Unorganised vendors'] },
  { name: 'Reema', who: 'Accessory seller', order: ['Unsanitary washrooms', 'Parking problem', 'Overcrowding', 'Waste management', 'Unorganised vendors'] },
];

export const CUSTOMER_SEGMENTS = ['Passersby', 'Regular customers', 'Tourists'] as const;

// Each vendor's ranking of who their customers are (first = main customer group).
export const CUSTOMER_VENDORS: { name: string; who: string; order: (typeof CUSTOMER_SEGMENTS[number])[] }[] = [
  { name: 'Reema', who: 'Accessory seller', order: ['Passersby', 'Regular customers', 'Tourists'] },
  { name: 'Suresh', who: 'Manager, Momoman', order: ['Regular customers', 'Passersby', 'Tourists'] },
  { name: 'Ravi', who: 'Sevpuri seller', order: ['Passersby', 'Tourists', 'Regular customers'] },
  { name: 'Gopal', who: 'Pan seller', order: ['Passersby', 'Regular customers', 'Tourists'] },
  { name: 'Sarita', who: 'Toy vendor', order: ['Passersby', 'Tourists', 'Regular customers'] },
];

// ── 08 Challenges and community support ──────────────────────────
// `note` is what we saw in the market behind each card (all of it is from the chapters above).
export const SCALE_ITEMS: { id: string; label: string; side: 'L' | 'R'; weight: number; note: string; evidence?: boolean }[] = [
  { id: 'competition', label: 'Intense competition', side: 'L', weight: 1.3, note: 'Raju and Neel worry about the market’s future as competition grows. For Naresh and Vani, other belt sellers are only a few steps away.' },
  { id: 'regulation', label: 'Regulatory stress', side: 'L', weight: 1.3, evidence: true, note: 'Naresh and Vani aren’t sure their licence is valid, and the rules keep changing. Valiben cleans around her stall to avoid being fined.' },
  { id: 'finance', label: 'Financial uncertainty', side: 'L', weight: 1.3, note: 'Naresh and Vani often lower the price, because every sale helps meet daily needs. Ravi Kumar, the AMC sweeper, struggles with wages that don’t cover basic needs.' },
  { id: 'shared', label: 'Shared challenges', side: 'R', weight: 1, note: 'All five vendors put unsanitary washrooms first in the card sort. It is the same problem for everyone, so no one carries it alone.' },
  { id: 'mutual', label: 'Mutual assistance', side: 'R', weight: 1, note: 'When Naresh had trouble with a UPI payment, a nearby vendor came to help without hesitation.' },
  { id: 'solidarity', label: 'Community solidarity', side: 'R', weight: 1, note: 'There’s a quiet sense of community in the market: people look out for one another.' },
];

// ── 09 Insights, and the evidence behind each ────────────────────
export const INSIGHTS: {
  id: 1 | 2 | 3; title: string; text: string;
  evidence: { text: string; chapter: string; key: string }[];
}[] = [
  {
    id: 1, title: 'It’s avoidance, not just inconvenience',
    text: 'The washroom problem isn’t just inconvenience, it’s avoidance culture. People have adapted to the unusable washrooms by simply not using them, which reduces complaints but also removes any pressure to improve them, creating a cycle of neglect.',
    evidence: [
      { text: 'All 5 vendors put unsanitary washrooms first in the card sort.', chapter: 'ch-sorting', key: 'washrooms' },
      { text: 'Krishna and Laxmanbhai point to unhygienic washrooms and inadequate facilities for women.', chapter: 'ch-interviews', key: 'disappointment' },
    ],
  },
  {
    id: 2, title: 'They don’t oppose change, they fear losing their place',
    text: 'Vendors don’t oppose change, they fear losing their place in the market. Many resist upgrades not because they reject progress but because they don’t see a version of modernisation where they still belong.',
    evidence: [
      { text: 'Renovation was planned three times and never happened.', chapter: 'ch-market', key: 'renovations' },
      { text: 'Ansar likes the market as it is and fears change would disrupt its essence.', chapter: 'ch-interviews', key: 'satisfaction' },
      { text: 'Raju and Neel worry about the market’s future as competition grows.', chapter: 'ch-interviews', key: 'declining' },
    ],
  },
  {
    id: 3, title: 'Vendors play by unspoken rules',
    text: 'Vendors play by unspoken rules to survive. Whether it’s toy sellers avoiding AMC fines or food vendors hiding goods, they’ve adapted to work around regulations rather than rely on them, showing a system that runs on informal agreements instead of structured support.',
    evidence: [
      { text: 'Valiben cleans the area around her stall to avoid being fined.', chapter: 'ch-day', key: 'fines' },
      { text: 'Naresh and Vani aren’t sure their licence is valid, and the rules keep changing.', chapter: 'ch-shadowing', key: 'uncertainty' },
    ],
  },
];
