import React from 'react';

export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const getInitials = (userName) => {
    if (!userName) return '?';
    const trimmed = userName.trim();
    if (!trimmed) return '?';
    
    const parts = trimmed.split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return trimmed.slice(0, Math.min(2, trimmed.length)).toUpperCase();
  };

  const getAvatarBg = (userName) => {
    const bgColors = [
      'bg-rose-500 text-white',
      'bg-indigo-500 text-white',
      'bg-emerald-500 text-white',
      'bg-amber-500 text-white',
      'bg-sky-500 text-white',
      'bg-violet-500 text-white',
      'bg-fuchsia-500 text-white',
      'bg-teal-500 text-white',
    ];
    if (!userName) return bgColors[0];
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % bgColors.length;
    return bgColors[index];
  };

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-16 h-16 text-xl font-bold',
  };

  const [imgError, setImgError] = React.useState(false);

  // Reset error state when src changes
  React.useEffect(() => {
    setImgError(false);
  }, [src]);

  const showImage = src && !imgError;

  return (
    <div className={`relative inline-block rounded-full overflow-hidden shrink-0 select-none ring-2 ring-white dark:ring-gray-800 ${sizes[size]} ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center font-bold ${getAvatarBg(name)}`}>
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
