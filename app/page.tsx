// app/page.tsx
import Link from "next/link";
import majorsData from "@/data/majors.json";
import { lalezar } from "@/utils/fonts";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1
            className={`text-4xl font-bold text-gray-800 mb-4 ${lalezar.className}`}
          >
            📚 همیار درس دانشگاه صنعتی ارومیه
          </h1>
          <p className="text-gray-600 text-lg">
            برنامه‌ای برای بررسی پیشرفت تحصیلی و مدیریت دروس دانشگاهی
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {majorsData.map((major) => (
            <Link
              key={major.slug}
              href={`/${major.slug}`}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
            >
              <div className="text-center flex flex-col justify-between h-full">
                <div className="text-4xl mb-4">🎓</div>
                <h2
                  className={`text-xl font-bold text-gray-800 mb-2 ${lalezar.className}`}
                >
                  {major.name}
                </h2>
                <p className="text-gray-600 text-sm">{major.description}</p>
                <div className="mt-4 bg-blue-100 text-blue-800 text-xs font-medium p-3 rounded-full inline-block">
                  مشاهده دروس
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Footer />
      </div>
    </div>
  );
}
