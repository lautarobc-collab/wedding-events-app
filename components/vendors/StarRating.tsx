export function StarRatingDisplay({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="text-amber-500 dark:text-amber-400" aria-label={`${rating} de 5 estrellas`}>
      {"★".repeat(rating)}
      <span className="text-neutral-300 dark:text-neutral-700">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? undefined : star)}
          className={
            value != null && star <= value
              ? "text-lg text-amber-500 dark:text-amber-400"
              : "text-lg text-neutral-300 dark:text-neutral-700"
          }
          aria-label={`${star} estrellas`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
