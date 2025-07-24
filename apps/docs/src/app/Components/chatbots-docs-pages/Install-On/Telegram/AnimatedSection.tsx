import useInView from "./AnimationScroll/useInView";

// Cleaned-up version
export default function AnimatedSection({ children, className = '' }) {
  const [ref, visible] = useInView();

  return (
   

    <div
      ref={ref}
      className={`
        transition-all duration-700 ease-in-out transform 
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
