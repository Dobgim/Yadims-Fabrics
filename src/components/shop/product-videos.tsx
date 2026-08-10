import { SectionHeading } from "@/components/shared/section-heading";

/**
 * The fabric, moving. Shown under the photo gallery on a product page when the
 * shop has uploaded one or more clips. Native `<video controls>` — no player
 * library, and `preload="metadata"` so a page with several videos does not
 * pull megabytes before the visitor presses play.
 */
export function ProductVideos({ videos, name }: { videos: string[] | undefined; name: string }) {
  // `videos` can be undefined on a database whose `videos` column has not been
  // added yet — the section simply does not render until there is one.
  if (!videos?.length) return null;

  return (
    <section className="section bg-secondary/40">
      <div className="container">
        <SectionHeading
          eyebrow="See it move"
          title="The fabric in motion"
          description="How this cloth drapes, catches the light and falls off the bolt — filmed in the shop."
          className="mb-12"
        />

        <div
          className={
            videos.length === 1
              ? "mx-auto max-w-3xl"
              : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          {videos.map((src) => (
            <div
              key={src}
              className="overflow-hidden rounded-3xl border border-border bg-black shadow-soft"
            >
              <video
                src={src}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full bg-black object-contain"
              >
                <span className="sr-only">A video of {name}</span>
              </video>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
