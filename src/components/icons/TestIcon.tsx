import React from 'react';

interface TestIconProps {
  size?: number | string;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

const TestIcon: React.FC<TestIconProps> = ({
  size = 24,
  color = '#1C274C',
  className = '',
  ariaLabel,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={ariaLabel ? undefined : 'true'}
      aria-label={ariaLabel}
    >
      <path
        d="M4.56499 12.4068C4.29258 12.0947 3.81879 12.0626 3.50676 12.335C3.19472 12.6074 3.1626 13.0812 3.43501 13.3932L4.56499 12.4068ZM7.14286 16.5L6.57787 16.9932C6.7203 17.1564 6.92629 17.25 7.14286 17.25C7.35942 17.25 7.56542 17.1564 7.70784 16.9932L7.14286 16.5ZM15.565 7.99324C15.8374 7.68121 15.8053 7.20742 15.4932 6.93501C15.1812 6.6626 14.7074 6.69472 14.435 7.00676L15.565 7.99324ZM10.5064 11.5068C10.234 11.8188 10.2662 12.2926 10.5782 12.565C10.8902 12.8374 11.364 12.8053 11.6364 12.4932L10.5064 11.5068ZM9.67213 14.7432C9.94454 14.4312 9.91242 13.9574 9.60039 13.685C9.28835 13.4126 8.81457 13.4447 8.54215 13.7568L9.67213 14.7432ZM3.43501 13.3932L6.57787 16.9932L7.70784 16.0068L4.56499 12.4068L3.43501 13.3932ZM7.70784 16.9932L9.67213 14.7432L8.54215 13.7568L6.57787 16.0068L7.70784 16.9932ZM11.6364 12.4932L13.6007 10.2432L12.4707 9.25676L10.5064 11.5068L11.6364 12.4932ZM13.6007 10.2432L15.565 7.99324L14.435 7.00676L12.4707 9.25676L13.6007 10.2432Z"
        fill={color}
      />
      <path
        d="M20.0002 7.5625L15.7144 12.0625M11.0002 16L11.4286 16.5625L13.5715 14.3125"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TestIcon;
