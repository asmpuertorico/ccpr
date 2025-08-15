import { notFound } from "next/navigation";
import { getStorage } from "@/lib/storage";
import Image from "next/image";
import Container from "@/components/Container";

export default async function EventDetail({ params }: { params: { id: string } }) {
  const item = await getStorage().get(params.id);
  if (!item) notFound();
  return (
    <main className="py-10">
      <Container>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-ink/10">
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">{item.name}</h1>
            <p className="text-ink/70 mt-2">{item.date} · {item.time}</p>
            <p className="text-ink/70 mt-1">{item.planner}</p>
            {item.description && <p className="mt-4">{item.description}</p>}
          </div>
        </div>
      </Container>
    </main>
  );
}



