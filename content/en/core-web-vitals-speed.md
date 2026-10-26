---
slug: core-web-vitals-speed
title: "Core Web Vitals: What Google Actually Measures About Your Site's Speed"
description: "A plain-language breakdown of the three Core Web Vitals (LCP, INP, CLS) with their official thresholds, why slow sites lose rankings and revenue — plus the first 6 fixes with real impact."
date: 2026-09-28
category: web-dev
tags: [site speed, Core Web Vitals, web performance, PageSpeed]
language: en
cover: "/assets/images/articles/core-web-vitals-speed/cover.png"
---

"Your site is slow" is a vague sentence that fixes nothing — Google wanted it measurable, so it defined three metrics called Core Web Vitals, now part of the page-experience ranking signals. Here I break down each metric: what it measures, the official "good" threshold, and the practical fix closest to you.

## The three metrics with official numbers

| Metric | What it measures | Good | Poor |
|---|---|---|---|
| LCP | When the largest visible element appears | ≤ 2.5s | > 4s |
| INP | Response to the user's first interaction | ≤ 200ms | > 500ms |
| CLS | Layout stability (unexpected shifting) | ≤ 0.1 | > 0.25 |

These thresholds come from Google's official documentation, and they are measured on real users (field data), not just lab tests — an important difference: your site may look excellent in a lab test and still lose in the field because your visitors are on slower networks.

## LCP: the biggest thing your visitor sees

Usually the cover image or main heading. Everything delaying it hurts the metric: a slow server, a huge uncompressed image, late-loading fonts, and render-blocking scripts. The highest-impact fixes, in order:

1. **Shrink the hero image:** WebP or AVIF, actual display size, lazy-loading for every image below the first screen.
2. **Make the LCP element a load priority:** `<link rel="preload">` for the cover image gives the browser an early start.
3. **Cut render-blocking scripts:** every non-deferred JS in the first screen delays the first paint — defer everything not needed for the initial view.

## INP: does the page hear the user?

When the user taps a button, how long until they see a response? The enemies here: long JavaScript tasks blocking the main thread, and heavy event listeners. The short version: split big operations, defer non-essential code past the first interaction, and never run a huge library for a job ten lines can do.

## CLS: stop the jumping page

Classic causes: images without defined dimensions (width/height), ads or widgets injected above content, and fonts swapping with different metrics. Fixes: set dimensions on every image and media, reserve space for dynamic units up front, and use `font-display: swap` with a fallback font of close metrics.

## Measure first, guess never

Open [PageSpeed Insights](https://pagespeed.web.dev/), enter your URL: you get two sections — "field data" (real users) and "lab diagnostics." Focus on field data first; for a new site without enough field data, use diagnostics as your baseline and track monthly.

> Practical rule: do not fix what you have not measured. Most random "speed optimizations" add complexity with no gain — your measurement tells you where the money actually is.

## The revenue impact (without exaggeration)

Speed affects three fronts: rankings (page-experience signal), conversion (impatient visitors), and the ads experience itself (a jumping page pushes visitors to close before any click). Speed is not a technical luxury — it is savings on every step of the visitor journey.

## Suggested work order for a typical Arabic site

1. Compress and convert images to WebP (biggest gain per effort).
2. Defer non-critical scripts and remove duplicates.
3. Image dimensions and reserved widget spaces (CLS).
4. Fonts: self-host or preload only the primary font.
5. Review hosting, enable caching and CDN.

---

Summary: Core Web Vitals are not slogans — three clear numbers, each with common causes and known fixes. Measure, fix the highest impact, re-measure in two weeks. That loop alone puts you ahead of 90% of competitors.
