import Image from "next/image";
import { notFound } from "next/navigation";
import { blogPosts, business } from "@/lib/data";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, image: post.image, datePublished: post.publishedAt, author: { "@type": "Organization", name: post.author }, publisher: { "@type": "Organization", name: business.name } };
  return (
    <article className="container max-w-4xl py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-sm font-bold uppercase text-primary">{post.category}</p>
      <h1 className="mt-3 text-4xl font-black md:text-5xl">{post.title}</h1>
      <p className="mt-4 text-muted-foreground">{post.excerpt}</p>
      <div className="relative my-8 aspect-[16/9] overflow-hidden rounded-lg"><Image src={post.image} alt={post.title} fill className="object-cover" sizes="100vw" /></div>
      <div className="prose prose-slate max-w-none dark:prose-invert"><p>{post.content}</p></div>
    </article>
  );
}
