import React from 'react';
import { AccessibilityProps } from '@/types/dashboard';
import { ARIA_LABELS } from '@/config/dashboard';

interface SearchBarProps extends AccessibilityProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  disabled = false,
  className = '',
  ...accessibilityProps
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit?.(value.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      aria-label={ARIA_LABELS.searchBox}
      style={{
        width: 420,
        maxWidth: '100%',
        background: '#232326',
        border: '1.5px solid #232326',
        borderRadius: 8,
        padding: '9px 18px',
        color: '#fff',
        fontSize: 16,
        fontWeight: 500,
        outline: 'none',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        transition: 'border 0.2s, box-shadow 0.2s',
        marginRight: 24,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
      }}
      onFocus={(e) => {
        if (!disabled) {
          e.target.style.border = '1.5px solid #1d4ed8';
          e.target.style.boxShadow = '0 0 0 3px rgba(29, 78, 216, 0.1)';
        }
      }}
      onBlur={(e) => {
        e.target.style.border = '1.5px solid #232326';
        e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
      }}
      {...accessibilityProps}
    />
  );
};

interface NotificationIconProps {
  hasNotifications?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
  hasNotifications = false,
  onClick,
  disabled = false,
}) => {
  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={ARIA_LABELS.notifications}
      aria-describedby={hasNotifications ? 'notification-badge' : undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 24,
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
        padding: '4px',
        borderRadius: '4px',
        transition: 'background 0.2s',
      }}
      onFocus={(e) => {
        if (!disabled) {
          e.currentTarget.style.outline = '2px solid #1d4ed8';
          e.currentTarget.style.outlineOffset = '2px';
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = '#232326';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <svg width="22" height="22" fill="none" stroke="#b3b3b3" strokeWidth="1.7" viewBox="0 0 24 24">
        <path d="M18 16v-5a6 6 0 1 0-12 0v5l-1.5 2v1h15v-1l-1.5-2z"/>
        <circle cx="12" cy="20" r="1.5"/>
      </svg>
      {hasNotifications && (
        <span
          id="notification-badge"
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 8,
            height: 8,
            background: '#f43f5e',
            borderRadius: '50%',
            border: '2px solid #18181b',
            display: 'block',
          }}
          aria-label="New notifications available"
        />
      )}
    </span>
  );
};

interface UserAvatarProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    initials?: string;
  };
  onClick?: () => void;
  disabled?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  onClick,
  disabled = false,
}) => {
  const initials = user?.initials || user?.name?.split(' ').map(n => n[0]).join('') || 'U';
  
  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={ARIA_LABELS.userMenu}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: user?.avatar ? `url(${user.avatar})` : '#232326',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: 16,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onFocus={(e) => {
        if (!disabled) {
          e.currentTarget.style.outline = '2px solid #1d4ed8';
          e.currentTarget.style.outlineOffset = '2px';
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {!user?.avatar && initials}
    </span>
  );
};

export { SearchBar, NotificationIcon, UserAvatar };
