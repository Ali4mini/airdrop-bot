export const Tasks = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">Earn Coins</h1>

      <div className="flex flex-col gap-3">
        {/* Task Item 1 */}
        <div className="card bg-gray-900 shadow-xl border border-gray-800">
          <div className="card-body p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-xl">
                🐦
              </div>
              <div>
                <h2 className="font-bold">Follow Twitter</h2>
                <p className="text-xs opacity-70">+5,000 coins</p>
              </div>
            </div>
            <button className="btn btn-sm btn-primary rounded-full">
              Start
            </button>
          </div>
        </div>

        {/* Task Item 2 */}
        <div className="card bg-gray-900 shadow-xl border border-gray-800">
          <div className="card-body p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-xl">
                ✈️
              </div>
              <div>
                <h2 className="font-bold">Join Telegram</h2>
                <p className="text-xs opacity-70">+5,000 coins</p>
              </div>
            </div>
            <button className="btn btn-sm btn-primary rounded-full">
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
