const levelbarempty = "<:white:1276830948008394806>";
const levelbarfilled = "<:blue:1276830984867676192>";
const base = 50;
const exponent = 2;

// Function to generate emoji level bar and determine user level based on experience
function generateLevelDetails(experience) {
  const currentLevel = Math.floor(Math.pow(experience / base, 1 / exponent)) + 1;
  const nextLevel = currentLevel + 1;
  const currentLevelExperience = Math.pow(currentLevel - 1, exponent) * base;
  const nextLevelExperience = Math.pow(currentLevel, exponent) * base;
  const totalChars = 10;
  const filledChars = Math.floor(
    (experience - currentLevelExperience) / 
    ((nextLevelExperience - currentLevelExperience) / totalChars)
  );
  const emptyChars = totalChars - filledChars;
  const levelBar = levelbarfilled.repeat(filledChars) + levelbarempty.repeat(emptyChars);
  const currentExpProgress = experience - currentLevelExperience;
  const requiredexperience = nextLevelExperience - experience;
  return { currentLevel, nextLevel, levelBar, nextLevelExperience, currentExpProgress, requiredexperience };
}

// Function to calculate experience required for a given level
function calculateExperienceFromLevel(level) {
  if (level < 1) {
    throw new Error("Level must be 1 or higher");
  }
  return Math.pow(level - 1, exponent) * base;
}

module.exports = { generateLevelDetails, calculateExperienceFromLevel };