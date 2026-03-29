import { cn } from "@/lib/utils";

type SectionShellProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
};

export const SectionShell = ({
  id,
  children,
  className,
}: SectionShellProps) => {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24 py-10 md:py-14 lg:py-16",
        className
      )}
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-8">{children}</div>
    </section>
  );
};
