type Props = { params: Promise<{ slug: string }> };

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  return (
    <article className="container mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight text-black">
        Article: {slug}
      </h1>
      <p className="mt-4 text-gray-500">
        Full technical article content will render here.
      </p>
    </article>
  );
}
