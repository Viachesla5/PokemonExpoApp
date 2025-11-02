export const Fonts = {
  regular: 'Rubik-Regular',
  medium: 'Rubik-Medium',
  semiBold: 'Rubik-SemiBold',
  bold: 'Rubik-Bold',
  light: 'Rubik-Light',
};

export type FontFamily = typeof Fonts[keyof typeof Fonts];

