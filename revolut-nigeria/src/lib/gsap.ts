import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Mobile browsers resize the viewport when their toolbars slide away;
// rebuilding a pinned timeline on every one of those would make it jump.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
