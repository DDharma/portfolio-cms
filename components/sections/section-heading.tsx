import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  heading: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  titleIsHtml?: boolean;
  descriptionIsHtml?: boolean;
};

export const SectionHeading = ({
  heading,
  title,
  description,
  align = "left",
  titleIsHtml = false,
  descriptionIsHtml = false,
}: SectionHeadingProps) => {
  return (
    <div
      className={cn("flex flex-col gap-3", {
        "text-center items-center": align === "center",
      })}
    >
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-indigo-400/70">
        {heading}
      </span>
      <div className="space-y-2">
        <h2 className="text-2xl font-medium tracking-[-0.02em] text-white md:text-3xl lg:text-4xl">
          {titleIsHtml ? (
            <span dangerouslySetInnerHTML={{ __html: title }} />
          ) : (
            title
          )}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm text-zinc-400 md:text-base">
            {descriptionIsHtml ? (
              <span dangerouslySetInnerHTML={{ __html: description }} />
            ) : (
              description
            )}
          </p>
        ) : null}
      </div>
    </div>
  );
};
