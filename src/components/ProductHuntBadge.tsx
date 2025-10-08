'use client'

import Image from 'next/image'

export function ProductHuntBadge() {
  return (
    <a
      href="https://www.producthunt.com/products/seo-jobs-wakeuphappy?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-seo&#0045;jobs&#0045;wakeuphappy"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Image
        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1023457&theme=light&t=1759843900669"
        alt="SEO&#0032;Jobs&#0032;&#0062;&#0032;WakeUpHappy&#0032;&#0058;&#0041; - SEO&#0032;&#0038;&#0032;GEO&#0032;Jobs&#0032;in&#0032;Europe | Product Hunt"
        width={250}
        height={54}
        unoptimized
        priority
      />
    </a>
  )
}
