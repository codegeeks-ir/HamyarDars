// app/[major]/page.tsx
import { notFound } from "next/navigation";
import CourseManager from "@/components/CourseManager";
import majorsData from "@/data/majors.json";

interface PageProps {
  params: Promise<{ major: string }>;
}

export async function generateStaticParams() {
  return majorsData.map((major) => ({
    major: major.slug,
  }));
}

export default async function MajorPage({ params }: PageProps) {
  const { major } = await params;
  const majorInfo = majorsData.find((m) => m.slug === major);

  if (!majorInfo) {
    notFound();
  }

  return <CourseManager majorInfo={majorInfo} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { major } = await params;
  const majorInfo = majorsData.find((m) => m.slug === major);

  return {
    title: majorInfo ? `${majorInfo.name} - همیار درس` : "همیار درس",
  };
}
