import React from 'react';
import { NavItem, AccessibilityProps } from '@/types/dashboard';
import { ARIA_LABELS } from '@/config/dashboard';

interface SidebarNavItemProps extends AccessibilityProps {
  item: NavItem;
  isActive?: boolean;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  isActive = false,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
  disabled = false,
  disabledTooltip,
  ...accessibilityProps
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={ARIA_LABELS.navItem(item.label)}
      title={disabled && disabledTooltip ? disabledTooltip : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 18px',
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 700,
        fontSize: 15,
        letterSpacing: 0.1,
        background: isHovered || isActive ? '#232326' : 'transparent',
        color: isActive ? '#fff' : '#b3b3b3',
        transition: 'background 0.2s, color 0.2s',
        marginBottom: 2,
        outline: 'none',
        opacity: disabled ? 0.5 : 1,
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid #1d4ed8';
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
      {...accessibilityProps}
    >
      <span style={{ 
        color: disabled ? '#6b7280' : (isActive ? '#fff' : '#b3b3b3'), 
        fontSize: 17, 
        fontWeight: 700,
        transition: 'color 0.2s',
      }}>
        {item.icon}
      </span>
      <span style={{ 
        fontWeight: 700,
        color: disabled ? '#6b7280' : (isActive ? '#fff' : '#b3b3b3')
      }}>
        {item.label}
      </span>
      {disabled && (
        <span style={{ 
          marginLeft: 'auto',
          color: '#dc2626',
          fontSize: 12,
          fontWeight: 600,
        }}>
          🚫
        </span>
      )}
    </div>
  );
};

interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      {title && (
        <div style={{
          margin: '18px 0 6px 20px',
          fontSize: 11,
          color: '#888',
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
          {title}
        </div>
      )}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        padding: '0 8px',
      }}>
        {children}
      </div>
    </div>
  );
};

interface SidebarBrandProps {
  logo?: React.ReactNode;
  title: string;
  onClick?: () => void;
}

const SidebarBrand: React.FC<SidebarBrandProps> = ({
  logo,
  title,
  onClick,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ARIA_LABELS.logoLink}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '28px 20px 18px 20px',
        background: '#18181b',
        borderBottom: '1px solid #232326',
        marginBottom: 8,
        cursor: onClick ? 'pointer' : 'default',
        outline: 'none',
      }}
      onFocus={(e) => {
        if (onClick) {
          e.currentTarget.style.outline = '2px solid #1d4ed8';
          e.currentTarget.style.outlineOffset = '2px';
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
    >
      {logo && (
        <span style={{ fontSize: 28 }}>
          {logo}
        </span>
      )}
      <span style={{ 
        fontWeight: 700, 
        fontSize: 22, 
        letterSpacing: 1,
        color: '#fff',
      }}>
        {title}
      </span>
    </div>
  );
};

export { SidebarNavItem, SidebarSection, SidebarBrand };
