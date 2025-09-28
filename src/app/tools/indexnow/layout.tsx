import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IndexNow Submission & Validator Tool | SEO Tools by SEO-Vacancy",
  description: "Submit your URLs to IndexNow protocol with our validation tool. Check key files, validate URLs, and notify search engines instantly about your content changes.",
  keywords: "IndexNow, URL submission, search engine indexing, SEO tools, Bing IndexNow, website indexing",
  openGraph: {
    title: "IndexNow Submission & Validator Tool | SEO Tools by SEO-Vacancy",
    description: "Submit your URLs to IndexNow protocol with our validation tool. Check key files, validate URLs, and notify search engines instantly about your content changes.",
    type: "website",
  },
};

export default function IndexNowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}