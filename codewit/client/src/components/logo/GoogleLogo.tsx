// codewit/client/src/components/logo/GoogleLogo.tsx
interface GoogleLogoProps {
  className?: string; 
}

const GoogleLogo = ({ className }: GoogleLogoProps): JSX.Element => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className={className}
    >
      <path
        fill="#4285f4"
        fillOpacity="1"
        fillRule="evenodd"
        stroke="none"
        d="M13.72 7.159q-.002-.744-.127-1.432H7v2.708h3.767c-.162.875-.655 1.616-1.397 2.113v1.756h2.263c1.323-1.219 2.087-3.013 2.087-5.145"
      ></path>
      <path
        fill="#34a853"
        fillOpacity="1"
        fillRule="evenodd"
        stroke="none"
        d="M7 14c1.89 0 3.475-.627 4.633-1.696L9.37 10.548c-.627.42-1.43.668-2.37.668-1.824 0-3.367-1.231-3.918-2.886H.745v1.814C1.896 12.43 4.264 14 7 14"
      ></path>
      <path
        fill="#fbbc05"
        fillOpacity="1"
        fillRule="evenodd"
        stroke="none"
        d="M3.083 8.33c-.14-.42-.22-.869-.22-1.33 0-.461.08-.91.22-1.33V3.856H.745C.27 4.801 0 5.87 0 7c0 1.13.27 2.199.745 3.144z"
      ></path>
      <path
        fill="#ea4335"
        fillOpacity="1"
        fillRule="evenodd"
        stroke="none"
        d="M7 2.784c1.028 0 1.95.353 2.676 1.047l2.008-2.008C10.47.693 8.887 0 7 0 4.264 0 1.896 1.569.745 3.856L3.083 5.67C3.633 4.015 5.177 2.784 7 2.784"
      ></path>
    </svg>
  );
};

export default GoogleLogo;
