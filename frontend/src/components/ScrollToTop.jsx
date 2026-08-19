import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there is no hash in the URL, scroll to top
    if (!hash) {
      window.scrollTo(0, 0);
    }
    // If there is a hash, let the browser handle scrolling to the anchor natively,
    // or you can explicitly implement smooth scrolling to the element here if needed.
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
