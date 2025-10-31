export default function CourseCard({
  title,
  description,
  buttonText = "Подробнее",
  onButtonClick,
}) {
  return (
    <div className="card bg-base-100 shadow-md 
                    w-full sm:w-80 md:w-96 lg:w-122">
      <figure className="h-40 overflow-hidden">
      </figure>
      <div className="card-body">
        <h2 className="card-title text-lg md:text-xl">{title}</h2>
        <p className="text-sm md:text-base">{description}</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={onButtonClick}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
