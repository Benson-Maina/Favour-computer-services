import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container grid gap-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-72" />)}
    </div>
  );
}
