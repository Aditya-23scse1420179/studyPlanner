const generateAvatar = () => {
  const seed = Math.random().toString(36).substring(2, 15);
  return `https://api.dicebear.com/9.x/bottts/png?seed=${seed}&size=200&scale=80&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

module.exports = generateAvatar;