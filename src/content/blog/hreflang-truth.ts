import type { BlogPost } from '@/types/blog'

export const post: BlogPost = {
  slug: 'hreflang-truth-5-countries-study',
  title: 'Hreflang Implementation: A 2-month Analysis Across 5 Countries',
  summary: 'A controlled A/B test shows when hreflang helps or slightly hurts, and how measurement can be.',
  date: '2025-09-14',
  authorName: 'Riad JOSEPH',
  modules: [
    {
      type: 'jobList',
      title: 'International SEO jobs recently posted',
      tag: 'International SEO',
      limit: 6,
    },
  ],
  content: `
Hreflang in the Wild: What a Two-Month Test Really Showed Us  

We run multiple websites across five English-speaking markets — the US, [UK](https://seo-vacancy.eu/jobs/city/london), India, Canada and the Philippines. On paper that sounds simple enough, right? Different domains, same brand, just targeted locally.  

But in practice it drove us nuts. Google kept showing the wrong country pages. A US user would end up on the UK domain, Indian pages showed up in Canada, and so on. This “country cannibalization” isn’t just annoying for us, it’s confusing for the user and probably hurting conversions.  

So we decided to test the textbook fix: [hreflang](https://seo-vacancy.eu/jobs/tag/international-seo).  

---

## How We Set Up the Experiment  

Instead of rolling hreflang out everywhere, we wanted proof. Over two months, we set up a proper test:  

- 5 markets (US, UK, India, Canada, Philippines)  
- More than 100 million impressions in total (so enough data to matter)  
- Two groups of URLs: 461 with hreflang tags (the “test” group), 1,733 without (the “control”)  

We used a statistical approach called *[Difference-in-Differences](https://arxiv.org/pdf/2503.13323)*. In plain English: we didn’t just look at before vs after, we also compared against the control group. That way if seasonality or a Google update happened, we’d see whether it was hreflang that made the difference or just background noise.  

We tracked:  
- Cannibalized impressions (wrong country)  
- Non-cannibalized impressions (correct country)  
- Overall cannibalization rate  

---

## First Results: By Country  

When we looked at the countries in aggregate, the picture was already messy:  

| Country | Change in Cannibalization | Significance |

| USA     | -1.62%                     | Yes          |

| UK      | -0.02%                     | No           |

| India   | +2.66%                     | Yes          |

| Canada  | +2.88%                     | Yes          |

| Philippines | +3.73%                 | Yes          |  

So, only the US showed an improvement. The others either stayed flat (UK) or got worse. At first glance this made hreflang look like a failure everywhere but the US.  

But we had a hunch. Aggregating everything together might be hiding what was really going on.  

---

## Looking Deeper: By Page Category  

We split the data by page type. That meant 13 different page categories across 5 countries. In practice only 22 of those combos had enough impressions to be reliable, but it was still plenty to work with.  

That’s when things got interesting.  

### Where hreflang helped  

- **Branding and marketing pages** were the clearest winners:  
  - India: –28.78% cannibalization  
  - UK: –21.38%  
  - Philippines: –7.13%  

- **Article/blog pages** improved in some places:  
  - UK: –12.92%  
  - US: moderate gains  

- **Product selector pages** also got a boost in the US: –8.15%  

### Where hreflang made things worse  

- **Service and support pages** almost universally:  
  - Philippines: +21.16%  
  - Other markets also negative  

- **Articles** in certain places:  
  - Canada: +14.80%  
  - Philippines: +12.92%  

- **Product detail pages** varied by market:  
  - UK: +11.81%  
  - Philippines: +6.97%  

And these weren’t flukes — every one of the 22 category-level results was [statistically significant (p<0.001)](https://www.youtube.com/watch?v=tDl7Wd81K3c).  

---

## What We Learned (So Far)  

There are three things worth stressing here:  

- **We’re looking at Impressions, not clicks.** That means this isn’t about what users choose, it’s about what Google decides to show in each country for each query. This is the algorithm’s view of “which page is most relevant.”  

- **This isn’t finished.** Two months gave us a lot of signal, but it’s still a [proof of concept](https://seo-vacancy.eu/jobs/tag/enterprise-seo). We don’t yet have a final conclusion.  

- **We don’t know for sure if Google even used our hreflang tags.** They were implemented correctly, but Google sometimes ignores them, or takes months to fully process. That uncertainty is part of the challenge.  

And perhaps the most important:  

- **Content might be the real fix.** Hreflang can only do so much. If the content itself isn’t localized, Google has fewer reasons to show the “right” page. Think of hair care: the needs in humid Asia are different from dry, cold Canada, or from the US. Weather, culture, hair types — all of that changes what’s relevant. No hreflang tag can compensate for content that doesn’t speak to those local realities.  

---

## Why the Method Matters  

One reason we still trust these early results is the methodology. The [Difference-in-Differences](https://arxiv.org/pdf/2503.13323) setup let us separate hreflang’s effect from normal market drift. And with over 100 million impressions, we had the statistical power to see even small changes.  

Two months might sound short, but it was enough to capture a couple of Google update cycles without the data going stale.  

---

## Takeaways for International SEO  

A few lessons already stand out:  

- **Don’t assume hreflang is a silver bullet.** It may help, or it may backfire.  
- **Always use a control group.** Otherwise you risk mistaking background changes for a treatment effect.  
- **Segment your analysis.** The big averages are misleading.  
- **Remember content.** The closer your content matches local user needs, the less heavy lifting hreflang has to do.  

---

## Conclusion (for now)  

This [proof of concept](https://seo-vacancy.eu/jobs/tag/enterprise-seo) showed us that hreflang can reduce cannibalization in some markets and page types, but not in others. We’re not done yet — the final verdict is still open.  

What seems clear already is that the “fix” probably isn’t hreflang alone. Localized content that speaks to user realities (yes, even down to different hair needs by climate and culture) is likely the stronger, longer-term solution.  
  `.trim(),
}

export default post
