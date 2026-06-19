import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { getBlogPosts } from "@/lib/data";

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  return (
    <section className="container py-12">
      <SectionHeading eyebrow="Blog" title="Electronics Buying Guides and Service Tips" />
      <div className="grid gap-6 md:grid-cols-3">
        {blogPosts.length ? blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-lg border">
            <div className="relative aspect-[4/3] bg-secondary">{post.image ? <Image src={post.image} alt={post.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="33vw" /> : null}</div>
            <div className="p-5"><p className="text-xs font-bold uppercase text-primary">{post.category}</p><h2 className="mt-2 font-bold group-hover:text-primary">{post.title}</h2><p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p></div>
          </Link>
        )) : <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground md:col-span-3">No articles published yet.</div>}
      </div>
    </section>
  );
}
