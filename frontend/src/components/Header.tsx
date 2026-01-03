import { useTelegram } from '../hooks/useTelegram';

export const Header = () => {
  const { user } = useTelegram();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName) return '??';
    return `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#121212] border-b border-gray-800 pt-safe-top">
      <div className="flex justify-between items-center px-4 h-16">
        
        {/* LEFT: User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
            {getInitials(user?.first_name, user?.last_name)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Grandmaster</span>
            <span className="text-sm font-bold text-white tracking-wide">
              {user?.first_name || 'Unknown User'}
            </span>
          </div>
        </div>

        {/* RIGHT: Rank Badge */}
        <div className="flex items-center gap-2">
          <div className="badge badge-warning gap-1 p-3 font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
            </svg>
            Lvl 1
          </div>
        </div>
      </div>

      {/* NEW: Level Progress Bar attached to bottom of header */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2d2d2d]">
        <div 
          className="h-full bg-gradient-to-r from-[#ffd33d] to-[#f08c00]" 
          style={{ width: '35%' }} 
        />
      </div>
    </header>
  );
};
