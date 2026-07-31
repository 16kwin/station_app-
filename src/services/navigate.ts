import type { NavigateFunction } from 'react-router-dom';

let navigator: NavigateFunction;

export const setNavigator = (nav: NavigateFunction) => {
  navigator = nav;
};

export const navigateTo = (to: string) => {
  if (navigator) {
    navigator(to);
  } else {
    console.warn('Navigator is not initialized');
  }
};
