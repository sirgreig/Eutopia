module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated removed — Eutopia uses React Native's built-in
    // Animated API throughout (see AnimatedBuilding.tsx). Reanimated 4.x pulls in
    // react-native-worklets, whose version resolution broke the iOS pod install.
  };
};
