import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PalaceCell from '../../components/PalaceCell';
import { VI_STAR, VI_SIHUA, VI_BRIGHTNESS } from '../../lib/ziwei/vi-names';
import { generateChart } from '../../lib/ziwei/algorithm';
import type { BirthInfo } from '../../lib/ziwei/types';

// The repository preserves JSX for Next; tsx's standalone runner uses the
// classic JSX transform, which expects React as a global during SSR.
Object.assign(globalThis, { React });

const samples: BirthInfo[] = [
  { year: 1990, month: 6, day: 15, hour: 4, gender: 'male' },
  { year: 1985, month: 3, day: 20, hour: 6, gender: 'female' },
  { year: 1978, month: 11, day: 2, hour: 10, gender: 'male' },
];

let minorCount = 0;
for (const birth of samples) {
  const chart = generateChart(birth);
  for (const palace of chart.palaces) {
    const html = renderToStaticMarkup(React.createElement(PalaceCell, { palace }));
    for (const star of palace.stars) {
      // PalaceCell hiển thị tên Việt (tra bảng VI_STAR, fallback tên gốc)
      assert.ok(html.includes(VI_STAR[star.name] ?? star.name), `${palace.name} is missing ${star.name}`);
      if (star.type === 'minor') minorCount++;
    }
  }
}
assert.ok(minorCount > 0, 'samples must exercise minor stars');

const palace = generateChart(samples[0]).palaces[0];
const html = renderToStaticMarkup(React.createElement(PalaceCell, {
  palace: { ...palace, stars: [{ name: '测试杂耀', type: 'minor', brightnessRaw: '庙', siHua: '禄' }] },
}));
assert.match(html, new RegExp(`测试杂耀\\[${VI_BRIGHTNESS['庙'] ?? '庙'}\\]`), 'minor star brightness should be visible');
assert.match(html, new RegExp(`>${VI_SIHUA['禄'] ?? '禄'}<\\/`), 'minor star sihua should be visible when present');
console.log(`PalaceCell renders all stars in ${samples.length} charts, including ${minorCount} minor stars`);
