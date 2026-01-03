export const Friends = () => {
  return (
    <div className="flex-1 flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-2">Invite Friends</h1>
      <p className="text-center opacity-70 mb-8">
        You and your friend will receive bonuses
      </p>

      <div className="card w-full bg-gray-900 shadow-xl border border-gray-800 mb-6">
        <div className="card-body p-4">
          <h2 className="font-bold text-lg">My Referral Link</h2>
          <div className="join w-full mt-2">
            <input
              className="input input-bordered join-item w-full bg-black text-sm"
              value="https://t.me/mybot?start=123"
              readOnly
            />
            <button className="btn btn-primary join-item">Copy</button>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h3 className="font-bold mb-4">List of your friends (0)</h3>
        <div className="text-center opacity-50 py-10">
          You haven't invited anyone yet
        </div>
      </div>
    </div>
  );
};
