declare module 'react-lottie' {
  import { Component } from 'react';

  interface LottieProps {
    options: {
      loop?: boolean;
      autoplay?: boolean;
      animationData: any;
      rendererSettings?: {
        preserveAspectRatio?: string;
      };
    };
    height?: number;
    width?: number;
    isStopped?: boolean;
    isPaused?: boolean;
    speed?: number;
    direction?: number;
    ariaRole?: string;
    ariaLabel?: string;
    isClickToPauseDisabled?: boolean;
    title?: string;
    style?: React.CSSProperties;
  }

  export default class Lottie extends Component<LottieProps> {}
}