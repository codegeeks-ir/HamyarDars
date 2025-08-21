// components/CourseManager.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { CourseGroup, parseCSV } from "@/utils/csvParser";
import { parseTranscriptHTML } from "@/utils/transcriptParser";
import { Lalezar } from "next/font/google";

const lalezar = Lalezar({ weight: "400", subsets: ["latin", "arabic"] });

const CourseManager = () => {
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // بارگذاری داده‌های CSV
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        const response = await fetch("/ce-software.csv");
        const csvText = await response.text();
        let courseData = parseCSV(csvText);

        // محاسبه واحدهای گذرانده اولیه
        courseData = courseData.map((group) => ({
          ...group,
          passedUnits: group.courses
            .filter((course) => course.passed)
            .reduce((sum, course) => sum + course.units, 0),
        }));

        // بازیابی وضعیت ذخیره شده
        const savedData = localStorage.getItem("courseProgress");
        if (savedData) {
          try {
            const savedState: CourseGroup[] = JSON.parse(savedData);

            courseData = courseData.map((group) => {
              const savedGroup = savedState.find((g) => g.name === group.name);
              if (!savedGroup) return group;

              const updatedCourses = group.courses.map((course) => {
                const savedCourse = savedGroup.courses.find(
                  (c) => c.code === course.code
                );
                return savedCourse
                  ? { ...course, passed: savedCourse.passed }
                  : course;
              });

              const passedUnits = updatedCourses
                .filter((course) => course.passed)
                .reduce((sum, course) => sum + course.units, 0);

              return {
                ...group,
                courses: updatedCourses,
                passedUnits,
              };
            });
          } catch (e) {
            console.error("Error parsing saved data:", e);
          }
        }

        setGroups(courseData);
        setLoading(false);
      } catch (err) {
        setError("خطا در بارگذاری داده‌های دروس");
        setLoading(false);
        console.error("Error loading CSV:", err);
      }
    };

    loadCSVData();
  }, []);

  // ذخیره وضعیت در localStorage
  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem("courseProgress", JSON.stringify(groups));
    }
  }, [groups]);

  // پردازش فایل کارنامه
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const passedCourses = parseTranscriptHTML(content);

          setGroups((prevGroups) => {
            return prevGroups.map((group) => {
              const updatedCourses = group.courses.map((course) => ({
                ...course,
                passed: passedCourses.includes(course.code),
              }));

              const passedUnits = updatedCourses
                .filter((course) => course.passed)
                .reduce((sum, course) => sum + course.units, 0);

              return {
                ...group,
                courses: updatedCourses,
                passedUnits,
              };
            });
          });

          alert(`${passedCourses.length} درس با موفقیت استخراج شدند`);
        } catch (err) {
          setError("خطا در پردازش فایل کارنامه");
          console.error("Error parsing transcript:", err);
        }
      };

      reader.readAsText(file);
    },
    []
  );

  // تغییر وضعیت قبولی یک درس
  const toggleCoursePassed = (groupIndex: number, courseIndex: number) => {
    setGroups((prevGroups) => {
      return prevGroups.map((group, gIndex) => {
        if (gIndex !== groupIndex) return group;

        const updatedCourses = group.courses.map((course, cIndex) => {
          if (cIndex !== courseIndex) return course;
          return { ...course, passed: !course.passed };
        });

        const passedUnits = updatedCourses
          .filter((course) => course.passed)
          .reduce((sum, course) => sum + course.units, 0);

        return {
          ...group,
          courses: updatedCourses,
          passedUnits,
        };
      });
    });
  };

  // بازنشانی همه دروس
  const resetAllCourses = () => {
    if (confirm("آیا از بازنشانی تمام دروس اطمینان دارید؟")) {
      setGroups((prevGroups) =>
        prevGroups.map((group) => ({
          ...group,
          courses: group.courses.map((course) => ({
            ...course,
            passed: false,
          })),
          passedUnits: 0,
        }))
      );
    }
  };

  // تابع برای دریافت رنگ بر اساس درصد پیشرفت
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-emerald-500"; // کامل
    if (percentage >= 75) return "bg-green-500"; // نزدیک به کامل
    if (percentage >= 50) return "bg-amber-500"; // متوسط
    if (percentage >= 25) return "bg-orange-500"; // کم
    return "bg-red-500"; // بسیار کم
  };

  // تابع برای دریافت رنگ border بر اساس درصد پیشرفت
  const getBorderColor = (percentage: number) => {
    if (percentage >= 100) return "border-emerald-200"; // کامل
    if (percentage >= 75) return "border-green-200"; // نزدیک به کامل
    if (percentage >= 50) return "border-amber-200"; // متوسط
    if (percentage >= 25) return "border-orange-200"; // کم
    return "border-red-200"; // بسیار کم
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری داده‌های دروس...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 max-w-md text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <h2 className="text-red-800 font-medium mb-2">خطا</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h1
            className={
              "text-3xl font-bold text-gray-800 text-center mb-2 " +
              lalezar.className
            }
          >
            📚 همیار دروس − کامپیوتر نرم‌افزار
          </h1>
          <p className="text-gray-600 text-center mb-6">
            برنامه‌ای برای بررسی پیشرفت تحصیلی دانشگاه صنعتی ارومیه
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <label
              className={
                "bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 " +
                lalezar.className
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              وارد کردن از کارنامه
              <input
                type="file"
                accept=".html"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={resetAllCourses}
              className={
                "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 " +
                lalezar.className
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              بازنشانی همه دروس
            </button>
          </div>
          <p className="text-gray-500 text-center mt-4 text-sm">
            برای دریافت کارنامه ابتدا وارد&nbsp;
            <a
              href="https://edu.uut.ac.ir/"
              target="_blank"
              className="text-blue-500 hover:text-blue-700 transition"
            >
              سامانه سما
            </a>
            &nbsp;شده و سپس به این&nbsp;
            <a
              href="https://edu.uut.ac.ir/SamaWeb/WorkBookRequest.asp"
              target="_blank"
              className="text-blue-500 hover:text-blue-700 transition"
            >
              لینک
            </a>
            &nbsp;مراجعه کرده و صفحه را در قالب html ذخیره کنید.
          </p>
        </div>

        {/* Mobile Group Selector (only shows on small screens) */}
        <div className="lg:hidden mb-6">
          <label
            htmlFor="group-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            انتخاب گروه درسی
          </label>
          <select
            id="group-select"
            className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={activeTab || ""}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="">همه گروه‌ها</option>
            {groups.map((group, index) => (
              <option key={index} value={group.name}>
                {group.name} ({group.passedUnits}/{group.requiredUnits})
              </option>
            ))}
          </select>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {groups.map((group, index) => {
            const progressPercentage =
              (group.passedUnits / group.requiredUnits) * 100;
            const isComplete = progressPercentage >= 100;

            return (
              <div
                key={index}
                className={`rounded-xl p-4 shadow-sm border-r-4 ${
                  isComplete ? "border-emerald-500" : "border-blue-500"
                } transition-all hover:shadow-md ${
                  group.name == activeTab ? "bg-blue-50" : "bg-white "
                }`}
                onClick={() =>
                  setActiveTab(activeTab === group.name ? null : group.name)
                }
              >
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className={
                      "font-medium text-gray-800 text-sm line-clamp-2 "
                    }
                  >
                    {group.name}
                  </h3>
                  <span
                    className={`text-xs text-center px-2 py-1 rounded-full ${
                      isComplete
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {isComplete ? "تکمیل شده" : "در حال پیشرفت"}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={
                      "text-2xl font-bold text-gray-900 " + lalezar.className
                    }
                  >
                    {group.passedUnits}
                  </span>
                  <span className="text-gray-500">
                    از {group.requiredUnits}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(
                      progressPercentage
                    )}`}
                    style={{ width: `${Math.min(100, progressPercentage)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {Math.round(progressPercentage)}% تکمیل
                </p>
              </div>
            );
          })}
        </div>

        {/* Course Groups */}
        <div className="space-y-6">
          {groups.map((group, groupIndex) => {
            const progressPercentage =
              (group.passedUnits / group.requiredUnits) * 100;

            // Skip rendering if activeTab is set and doesn't match
            if (activeTab && activeTab !== group.name) return null;

            return (
              <div
                key={groupIndex}
                className={`bg-white rounded-2xl shadow-md overflow-hidden border ${getBorderColor(
                  progressPercentage
                )} transition-all hover:shadow-lg`}
              >
                <div
                  className={`p-5 ${
                    progressPercentage >= 100 ? "bg-emerald-50" : "bg-blue-50"
                  } border-b ${getBorderColor(progressPercentage)}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2
                        className={
                          "text-xl font-bold text-gray-800 flex items-center gap-2 " +
                          lalezar.className
                        }
                      >
                        {group.name}
                        {progressPercentage >= 100 && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            تکمیل شده
                          </span>
                        )}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {group.passedUnits} از {group.requiredUnits} واحد
                        گذرانده شده
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${getProgressColor(
                              progressPercentage
                            )}`}
                            style={{
                              width: `${Math.min(100, progressPercentage)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.courses.map((course, courseIndex) => (
                      <label
                        key={courseIndex}
                        className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                          course.passed
                            ? "bg-emerald-50 border-emerald-200 shadow-sm"
                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center h-5 mt-0.5">
                          <input
                            type="checkbox"
                            checked={course.passed}
                            onChange={() =>
                              toggleCoursePassed(groupIndex, courseIndex)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="mr-3 flex-1 min-w-0">
                          <div
                            className={`font-medium text-sm ${
                              course.passed
                                ? "text-emerald-800"
                                : "text-gray-800"
                            }`}
                          >
                            {course.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span>کد: {course.code}</span>
                            <span className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5 ml-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                              {course.units} واحد
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {activeTab && !groups.some((group) => group.name === activeTab) && (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="text-gray-400 text-5xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              گروهی یافت نشد
            </h3>
            <p className="text-gray-500">گروه درسی انتخاب شده موجود نیست</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>همیار درس − برنامه نویسی شده توسط محسن فرج‌اللهی</p>
        </div>
      </div>
    </div>
  );
};

export default CourseManager;
