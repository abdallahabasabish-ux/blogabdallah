---
slug: search-console-first-steps
title: "Search Console From Zero: Your First 7 Steps After Adding a Site"
description: "A practical guide to your first week with Google Search Console: property setup, sitemap submission, indexing checks, and reading the performance report — ordered steps with no technical background needed."
date: 2026-10-08
category: seo
tags: [Search Console, SEO, indexing, Google]
language: en
cover: "/assets/images/articles/search-console-first-steps/cover.png"
---

Most site owners open Search Console once, see a screen full of jargon, and only return when something breaks. That is the wrong order — the tool is your direct line to Google's indexing, and its full value shows in the first week of correct setup. These seven steps are exactly what I do with any new site.

## 1) Add the site as a Domain property

When adding a site you get two options: a full Domain or a URL prefix. Choose Domain when you can — it covers all subdomains and both http and https in one property. The easiest verification for a Domain property is a TXT DNS record from your registrar.

## 2) Verify ownership with the DNS record

Copy the TXT record Google gives you, paste it into your domain's DNS management panel, wait a few minutes to a few hours for propagation, then click Verify. Do not delete the record later — it keeps your ownership verified.

## 3) Submit your sitemap

From the sidebar: Sitemaps → add your sitemap.xml URL → Submit. The sitemap tells Google your official page list; accelerating discovery matters even more than "accelerating indexing" itself. If your static site has no sitemap, generate one — platforms like GitHub Pages have ready generators that do it in one line.

## 4) Inspect your most important page by hand before waiting

Open "URL Inspection" and enter your homepage or strongest article. You will see the real indexing state: indexed, discovered-not-indexed, or not discovered. Use "Request indexing" for key pages — the daily quota is small but it is the fastest way to make Google look at your page now.

## 5) Learn to read the Performance report (after two weeks)

The performance report shows four numbers: impressions, clicks, average position, and CTR. Do not panic about position early — watch:

- **Queries:** what are people searching when you appear? If unplanned keywords show up, write a dedicated article about them.
- **Pages with high impressions and low clicks:** your title or description is not convincing — improve the title tag and meta description and clicks move.
- **Growing impressions week over week:** the real signal that your site is taking its place.

## 6) Watch the Pages report to see what is actually indexed

The "Page indexing" report shows how many pages are indexed out of what you submitted, plus exclusion reasons per page. Common ones: redirected pages, duplicates, or "Crawled — currently not indexed," which usually means Google saw them as lower value and will revisit as your content grows.

## 7) Turn on alerts and stop opening the tool hourly

Search Console emails you on real problems: crawl errors, security issues, or manual actions. Checking weekly is enough for new sites — daily anxiety does not add a single indexed page.

## Quick table: where to spend your time in the tool

| Section | When to open it | What to look for |
|---|---|---|
| Performance | Weekly | Rising queries; pages with weak CTR |
| URL Inspection | When publishing a key page | Indexing status and request indexing |
| Sitemaps | Once at setup | "Success" status |
| Pages | Weekly | Indexing ratio and exclusion reasons |
| Core Web Vitals | Monthly | Real-world performance issues |

## A common mistake: buying links instead of working on content

When results stall, some people buy "fast indexing" services and bulk paid links. Google treats this as clear manipulation and the penalty can be slower than your original patience. The correct sequence is simpler and cheaper: original content → proper indexing → consistent publishing.

---

Summary: Search Console is not just a dashboard — it is your early-warning system and your growth map. One setup week following these seven steps saves you months of confusion.
