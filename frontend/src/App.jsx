import CourseCard from "./components/CourseCard";

export default function App() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <CourseCard
        title="Advanced Tailwind"
        description="Углублённый курс по Tailwind CSS"
        buttonText="Подробнее"
        onButtonClick={() => alert("Tailwind course")} />
    </div>
  );
}
