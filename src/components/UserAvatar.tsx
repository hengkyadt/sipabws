import React from 'react';

interface UserAvatarProps {
  name: string;
  role?: 'admin' | 'student' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatusIndicator?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  role = 'student',
  size = 'md',
  className = '',
  showStatusIndicator = false
}) => {
  // Extract initials (up to 2 characters)
  const getInitials = (fullName: string): string => {
    if (!fullName) return '?';
    // Clean common Indonesian academic titles to get real name initials
    const clean = fullName
      .replace(/^(Ir\.|Dr\.|Drs\.|Dra\.|Prof\.)\s*/i, '')
      .replace(/,\s*(M\.T\.|S\.T\.|M\.Sc\.|M\.Kom|S\.Kom|Ph\.D).*$/i, '')
      .trim();

    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const initials = getInitials(name);
  const isAdmin = role === 'admin';

  // Size configurations
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs font-semibold',
    lg: 'w-9 h-9 text-xs sm:text-sm font-bold',
    xl: 'w-12 h-12 text-base font-bold'
  }[size];

  // Deterministic color styling for student avatars
  const getStudentStyle = (str: string) => {
    const styles = [
      'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-400/40',
      'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400/40',
      'bg-gradient-to-br from-cyan-600 to-blue-700 text-white border-cyan-400/40',
      'bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-violet-400/40',
      'bg-gradient-to-br from-teal-600 to-emerald-700 text-white border-teal-400/40'
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % styles.length;
    return styles[idx];
  };

  const avatarStyle = isAdmin
    ? 'bg-gradient-to-br from-[#F28C28] to-amber-600 text-white border-amber-300/50 shadow-xs'
    : getStudentStyle(name);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`${sizeClasses} ${avatarStyle} rounded-xl font-bold flex items-center justify-center tracking-wider select-none border shadow-2xs font-mono`}
        title={`${name} (${isAdmin ? 'Administrator Workshop' : 'Mahasiswa PTKI'})`}
      >
        <span>{initials}</span>
      </div>

      {showStatusIndicator && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
            isAdmin ? 'bg-[#F28C28]' : 'bg-emerald-500'
          }`}
        />
      )}
    </div>
  );
};

export default UserAvatar;

