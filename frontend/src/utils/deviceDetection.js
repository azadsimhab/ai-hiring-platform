// Device Detection and Responsive Testing Utilities

export const getDeviceType = () => {
  const width = window.innerWidth;
  
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export const isMobile = () => {
  return window.innerWidth < 768;
};

export const isTablet = () => {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = () => {
  return window.innerWidth >= 1024;
};

export const getTouchSupport = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const getScreenInfo = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    deviceType: getDeviceType(),
    touchSupport: getTouchSupport(),
    userAgent: navigator.userAgent,
    pixelRatio: window.devicePixelRatio || 1
  };
};

// Test responsive breakpoints
export const testResponsiveBreakpoints = () => {
  const breakpoints = [
    { name: 'mobile-sm', width: 320 },
    { name: 'mobile-md', width: 375 },
    { name: 'mobile-lg', width: 414 },
    { name: 'tablet-sm', width: 768 },
    { name: 'tablet-lg', width: 1024 },
    { name: 'desktop-sm', width: 1280 },
    { name: 'desktop-lg', width: 1920 }
  ];
  
  const currentWidth = window.innerWidth;
  const currentBreakpoint = breakpoints.find((bp, index) => {
    const nextBp = breakpoints[index + 1];
    return currentWidth >= bp.width && (!nextBp || currentWidth < nextBp.width);
  });
  
  return {
    current: currentBreakpoint,
    all: breakpoints,
    width: currentWidth
  };
};