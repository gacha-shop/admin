export function GNB() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Gacha Store Admin
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            관리자
          </button>
        </div>
      </div>
    </header>
  );
}
