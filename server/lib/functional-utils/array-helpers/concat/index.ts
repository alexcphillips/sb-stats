export const concat = (child) => (parent) => {
  console.log('CONCAT - child:', child, ', parent:', parent);
  return parent.concat(child);
};
