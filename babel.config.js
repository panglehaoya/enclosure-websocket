module.exports = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      { modules: false },
    ],
    require.resolve('@babel/preset-typescript'),
  ],
};
