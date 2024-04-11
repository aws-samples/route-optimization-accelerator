/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
export const COLOR_PALETTE = [
  "#4c72b0",
  "#dd8452",
  "#55a868",
  "#c44e52",
  "#8172b3",
  "#937860",
  "#da8bc3",
  "#8c8c8c",
  "#ccb974",
  "#64b5cd",
];

export const getRandomColor = () => {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const hexToRGB = (hex: string) => {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
};

export const numberToHex = (c: number) => {
  var hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

export const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + numberToHex(r) + numberToHex(g) + numberToHex(b);
};

export const getDarkerColor = (hex: string, tolerance = 20) => {
  const rgb = hexToRGB(hex);

  return rgbToHex(rgb.r - tolerance, rgb.g - tolerance, rgb.b - tolerance);
};

export const getColorList = (numberOfColors: number): string[] => {
  if (numberOfColors < COLOR_PALETTE.length) {
    return COLOR_PALETTE.slice(0, numberOfColors);
  }

  const toGenerate = numberOfColors - COLOR_PALETTE.length;
  const generated = new Array(toGenerate).fill(0).map(getRandomColor);

  return COLOR_PALETTE.concat(generated);
};
