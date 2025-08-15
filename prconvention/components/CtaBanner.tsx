import Container from "@/components/Container";

type Dict = { cta: { title: string; contact: string } };

export default function CtaBanner({ locale, dict }: { locale: string; dict: Dict }) {
  return (
    <section className="bg-ink text-white">
      <Container className="py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-xl font-semibold">{dict.cta.title}</h3>
        <a
          href={`/${locale}/contact`}
          className="inline-flex items-center rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          {dict.cta.contact}
        </a>
      </Container>
    </section>
  );
}



