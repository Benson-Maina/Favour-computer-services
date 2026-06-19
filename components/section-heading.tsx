export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      {eyebrow ? <p className="mb-2 text-sm font-bold uppercase tracking-normal text-primary">{eyebrow}</p> : null}
      <h2 className="text-2xl font-bold tracking-normal md:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
    </div>
  );
}
