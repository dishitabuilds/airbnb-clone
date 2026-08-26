import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const R = (p) => path.join(HERE, p);

const icons = JSON.parse(fs.readFileSync(R('icons.source.json'), 'utf8'));

// index -> exported component name. Derived from the labels printed during extraction.
const NAMES = {
  0: 'AirbnbLogo', 1: 'Globe', 2: 'Menu', 3: 'Share', 4: 'Heart', 5: 'GridDots',
  6: 'GuestFavourite', 7: 'StarSmall', 8: 'OutdoorEntertainment', 9: 'StayingCool',
  10: 'SelfCheckIn', 11: 'ChevronRightTiny', 12: 'Kitchen', 13: 'Wifi', 14: 'Workspace',
  15: 'Parking', 16: 'Pool', 17: 'HotTub', 18: 'Pets', 19: 'SecurityCamera',
  20: 'CarbonMonoxideAlarm', 21: 'SmokeAlarm', 22: 'ChevronLeftSmall', 23: 'ClearDates',
  24: 'Guests', 25: 'Flag', 26: 'Cleanliness', 27: 'Accuracy', 28: 'CheckInRating',
  29: 'Communication', 30: 'LocationRating', 31: 'Value', 32: 'Search', 33: 'ZoomIn',
  34: 'ZoomOut', 35: 'MapPin', 36: 'BornIn', 37: 'School', 38: 'Shield', 39: 'MessageHost',
  40: 'Back', 41: 'Close', 42: 'ArrowLeft', 43: 'ArrowRight', 44: 'Hairdryer',
  45: 'CleaningProducts', 46: 'Shampoo', 47: 'HotWater', 48: 'ShowerGel',
  49: 'WashingMachine', 50: 'Hangers', 51: 'BedLinen', 52: 'Blinds', 53: 'Iron',
  54: 'ClothesStorage', 55: 'Cot', 56: 'TV', 57: 'AirConditioning', 58: 'Fridge',
  59: 'Microwave', 60: 'Crockery', 61: 'Kettle', 62: 'Coffee', 63: 'WineGlasses',
  64: 'Toaster', 65: 'Blender', 66: 'Cooker', 67: 'PrivateEntrance', 68: 'Patio',
  69: 'OutdoorDining', 70: 'Gym', 71: 'LongTermStays',
};

// Amenity label -> icon component, so data rows can resolve their own icon.
const AMENITY_MAP = {
  'Kitchen': 'Kitchen', 'Wifi': 'Wifi', 'Dedicated workspace': 'Workspace',
  'Free parking on premises': 'Parking', 'Pool': 'Pool', 'Hot tub': 'HotTub',
  'Pets allowed': 'Pets', 'Exterior security cameras on property': 'SecurityCamera',
  'Carbon monoxide alarm': 'CarbonMonoxideAlarm', 'Smoke alarm': 'SmokeAlarm',
  'Hairdryer': 'Hairdryer', 'Cleaning products': 'CleaningProducts', 'Shampoo': 'Shampoo',
  'Hot water': 'HotWater', 'Shower gel': 'ShowerGel', 'Washing machine': 'WashingMachine',
  'Hangers': 'Hangers', 'Bed linen': 'BedLinen', 'Room-darkening blinds': 'Blinds',
  'Iron': 'Iron', 'Clothes storage': 'ClothesStorage', 'Cot': 'Cot', 'TV': 'TV',
  'Air conditioning': 'AirConditioning', 'Fridge': 'Fridge', 'Freezer': 'Fridge',
  'Microwave': 'Microwave', 'Cooking basics': 'Cooker',
  'Crockery and cutlery': 'Crockery', 'Kettle': 'Kettle', 'Coffee': 'Coffee',
  'Wine glasses': 'WineGlasses', 'Toaster': 'Toaster', 'Blender': 'Blender',
  'Cooker': 'Cooker', 'Private entrance': 'PrivateEntrance', 'Patio or balcony': 'Patio',
  'Outdoor dining area': 'OutdoorDining', 'Gym': 'Gym',
  'Long-term stays allowed': 'LongTermStays', 'Self check-in': 'SelfCheckIn',
  'Cleaning available during stay': 'CleaningProducts', 'Exercise equipment': 'Gym',
  'Ceiling fan': 'AirConditioning', 'Sofa': 'OutdoorEntertainment', 'Double bed': 'BedLinen',
};

// JSX-ify raw SVG inner markup: hyphenated attrs -> camelCase, self-close bare tags.
const ATTR = {
  'fill-rule': 'fillRule', 'clip-rule': 'clipRule', 'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit', 'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity', 'clip-path': 'clipPath', 'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity', 'stroke-dasharray': 'strokeDasharray',
  'xmlns:xlink': 'xmlnsXlink', 'xlink:href': 'xlinkHref', 'class': 'className',
};

function toJsx(html) {
  let s = html;
  for (const [k, v] of Object.entries(ATTR)) s = s.replaceAll(k + '=', v + '=');
  // close void-ish svg children that came through unclosed
  s = s.replace(/<(path|circle|rect|line|polyline|polygon|ellipse|use|stop|image)((?:[^>"']|"[^"]*"|'[^']*')*?)>/g,
    (m, tag, attrs) => `<${tag}${attrs.replace(/\/$/, '')} />`);
  s = s.replace(/<\/(path|circle|rect|line|polyline|polygon|ellipse|use|stop|image)>/g, '');
  // style="a:b;c:d" -> style={{a:'b'}}
  s = s.replace(/style="([^"]*)"/g, (m, css) => {
    const obj = css.split(';').filter(Boolean).map(rule => {
      const i = rule.indexOf(':');
      const prop = rule.slice(0, i).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      return `${prop}: ${JSON.stringify(rule.slice(i + 1).trim())}`;
    }).join(', ');
    return `style={{ ${obj} }}`;
  });
  return s.trim();
}

const parts = [];
parts.push(`// Auto-generated icon set. Every glyph is traced from the reference at the same
// viewBox and stroke weight so icons line up pixel-for-pixel at every size.
// Regenerate with: npm run gen:icons
import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

/**
 * \`size\` sets the icon's height; width follows the viewBox aspect ratio, so
 * non-square glyphs (the wordmark is roughly 3.2:1) are not squashed into a box.
 * Pass \`width\`/\`height\` explicitly to override.
 */
function Svg({ size = 24, viewBox, children, ...rest }: IconProps & { viewBox: string }) {
  const [, , vbW, vbH] = viewBox.split(/\\s+/).map(Number);
  const ratio = vbW && vbH ? vbW / vbH : 1;
  const width = typeof size === 'number' && ratio !== 1 ? Math.round(size * ratio * 100) / 100 : size;

  return (
    <svg
      viewBox={viewBox}
      width={width}
      height={size}
      aria-hidden="true"
      role="presentation"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}
`);

const exported = [];
icons.forEach((ic, i) => {
  const name = NAMES[i];
  if (!name) return;
  exported.push(name);
  const stroke = /stroke:currentColor/.test(ic.style) || /stroke="currentColor"/.test(ic.inner);
  // Stroke weight varies per glyph (the hamburger is 3, the lightbox arrows are 4).
  // Carry the captured value rather than assuming a uniform 2.
  const swMatch = /stroke-width:\s*([\d.]+)/.exec(ic.style || '');
  const strokeWidth = swMatch ? Number(swMatch[1]) : 2;
  const baseStyle = stroke
    ? `{{ display: 'block', fill: 'none', stroke: 'currentColor', strokeWidth: ${strokeWidth}, overflow: 'visible' }}`
    : `{{ display: 'block', fill: 'currentColor' }}`;
  parts.push(
`export function ${name}(props: IconProps) {
  return (
    <Svg viewBox="${ic.viewBox}" style=${baseStyle} {...props}>
      ${toJsx(ic.inner)}
    </Svg>
  );
}
`);
});

parts.push(`const AMENITY_ICONS: Record<string, (p: IconProps) => React.JSX.Element> = {
${Object.entries(AMENITY_MAP).map(([k, v]) => `  ${JSON.stringify(k)}: ${v},`).join('\n')}
};

/** Resolve an amenity label to its glyph, falling back to a neutral mark. */
export function amenityIcon(label: string) {
  return AMENITY_ICONS[label] ?? Kitchen;
}
`);

fs.writeFileSync(R('../src/components/icons.tsx'), parts.join('\n'));
console.log('generated', exported.length, 'icons');
console.log(exported.join(', '));
