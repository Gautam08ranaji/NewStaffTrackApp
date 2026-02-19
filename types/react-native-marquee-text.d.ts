declare module "react-native-marquee-text" {
  import { Component } from "react";
    import { StyleProp, TextStyle } from "react-native";

  export interface MarqueeTextProps {
    style?: StyleProp<TextStyle>;
    speed?: number;
    loop?: boolean;
    marqueeOnMount?: boolean;
    marqueeDelay?: number;
  }

  export default class MarqueeText extends Component<MarqueeTextProps> {}
}
