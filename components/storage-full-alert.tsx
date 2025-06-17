interface StorageFullAlertProps {
  percentage: number
}

export function StorageFullAlert({ percentage }: StorageFullAlertProps) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 transform rounded-lg bg-red-900/80 px-6 py-3 text-white backdrop-blur-sm">
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-lg font-bold">
          Storage {percentage >= 100 ? "Full" : "Almost Full"} ({percentage}%)
        </span>
      </div>
      <p className="mt-1 text-sm">
        {percentage >= 100
          ? "Cannot mine more resources. Trade resources or upgrade your submarine for more storage."
          : "Storage capacity is running low. Consider trading resources or upgrading your submarine."}
      </p>
    </div>
  )
}
