import React from 'react';
import { User } from '@/context/AppContext';

interface ModernAvatarProps {
  user?: User | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const ModernAvatar: React.FC<ModernAvatarProps> = ({ 
  user, 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const displayName = user?.name || name || 'User';
  
  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Generate consistent color based on name
  const getGradientColors = (name: string): string => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-cyan-500 to-blue-500',
      'from-teal-500 to-green-500',
      'from-red-500 to-pink-500',
      'from-amber-500 to-orange-500',
      'from-violet-500 to-purple-500',
      'from-emerald-500 to-teal-500',
    ];

    // Generate hash from name for consistent colors
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  // Size mappings
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const gradient = getGradientColors(displayName);
  const initials = getInitials(displayName);

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        bg-gradient-to-br ${gradient} 
        rounded-full 
        flex items-center justify-center 
        font-bold text-white 
        shadow-lg 
        ring-2 ring-white/20
        ${className}
      `}
      title={displayName}
    >
      {user?.profilePic ? (
        <img 
          src={user.profilePic} 
          alt={displayName}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span className="font-semibold tracking-wide">
          {initials}
        </span>
      )}
    </div>
  );
};

export default ModernAvatar;
