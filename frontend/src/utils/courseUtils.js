const getCategoryLabel = (courseType) => {
  const labels = {
    programming: "Программирование",
    design: "Дизайн",
    marketing: "Маркетинг",
    business: "Бизнес",
  };
  return labels[courseType] || courseType;
};

// FNV-1a 32-bit hash
function fnv1aHash(str) {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// Map hash to HSL color components
function hashToHSLs(seed) {
  const h = fnv1aHash(String(seed));
  const hue1 = h % 360;
  const hue2 = (h >>> 8) % 360;
  const sat = 55 + ((h >>> 16) % 20);      // 55-74%
  const light1 = 40 + ((h >>> 24) % 12);   // 40-51%
  const light2 = 58 + ((h >>> 20) % 12);   // 58-69%
  return {
    c1: `hsl(${hue1} ${sat}% ${light1}%)`,
    c2: `hsl(${hue2} ${sat}% ${light2}%)`,
  };
}

/**
 * Deterministic gradient generator
 * @param {string|number} seed unique identifier for course (id or slug)
 * @param {number} angle optional angle in degrees (default 135)
 * @returns {string} CSS linear-gradient(...)
 */
const getGradientForCourse = (index, angle = 135) => {
  const { c1, c2 } = hashToHSLs(String(index));
  return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
};

export { getCategoryLabel, getGradientForCourse };
