'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    // Observe already existing scroll-reveal elements
    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    // Watch for dynamic DOM updates (e.g. from Suspense, state loads, page loads)
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.classList.contains('scroll-reveal')) {
              observer.observe(node);
            }
            const descendants = node.querySelectorAll('.scroll-reveal');
            descendants.forEach((desc) => observer.observe(desc));
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
