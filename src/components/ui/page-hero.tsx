type PageHeroProps = {
  title: string;
  subtitle?: string;
};

/** Clean white hero — black title, gray subtitle (Good Dog–like). */
export function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="border-b border-gray-200 bg-white py-14 text-center md:py-16">
      <h1 className="text-4xl font-semibold tracking-tight text-black md:text-5xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500 md:text-xl">
          {subtitle}
        </p>
      ) : null}
    </section>
  );
}
