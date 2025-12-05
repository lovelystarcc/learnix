  const labels = {
    programming: "Программирование",
    design: "Дизайн",
    marketing: "Маркетинг",
    business: "Бизнес",
  };

export const getCategoryLabel = (courseType) => {
  return labels[courseType] || courseType;
};

export const getCategories = () => {
  return Object.entries(labels).map(([id, label]) => ({ id, label }));
};

function fnv1aHash(str) {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function hashToHSLs(seed) {
  const h = fnv1aHash(String(seed));
  const hue1 = h % 360;
  const hue2 = (h >>> 8) % 360;
  const sat = 55 + ((h >>> 16) % 20);
  const light1 = 40 + ((h >>> 24) % 12);
  const light2 = 58 + ((h >>> 20) % 12);
  return {
    c1: `hsl(${hue1} ${sat}% ${light1}%)`,
    c2: `hsl(${hue2} ${sat}% ${light2}%)`,
  };
}

export const getGradientForCourse = (index, angle = 135) => {
  const { c1, c2 } = hashToHSLs(String(index));
  return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
};

