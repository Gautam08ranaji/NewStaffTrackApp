import React from "react";
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import RemixIcon from "react-native-remix-icon";

interface Props {
  icon: string;
  count: number | string;
  title: string;

  cardBg?: string;
  bg?: string;

  iconBg?: string;
  iconColor?: string;

  countBg?: string;
  countColor?: string;
  countContainerStyle?: StyleProp<ViewStyle>;
  countTextStyle?: StyleProp<TextStyle>;

  subTitle?: number | string;
  subTitleColor?: string;
  subTitleStyle?: StyleProp<TextStyle>;

  titleColor?: string;
  titleStyle?: StyleProp<TextStyle>;

  onPress?: () => void;
}

export default function ReusableCard({
  icon,
  count,
  title,
  cardBg,
  bg = "#FFFFFF",

  iconBg = "#2F80ED20",
  iconColor = "#FFFFFF",

  countBg,
  countColor = "#000",
  countContainerStyle,
  countTextStyle,

  subTitle,
  subTitleColor = "#666",
  subTitleStyle,

  titleColor = "#000",
  titleStyle,

  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: cardBg ?? bg,
        padding: 10, // 👈 reduced padding
        borderRadius: 10, // 👈 smaller radius
        flex: 1,
        elevation: 3, // 👈 lighter shadow
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      {/* TOP ROW */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: iconBg,
            padding: 6, // 👈 smaller icon padding
            borderRadius: 8,
          }}
        >
          <RemixIcon name={icon as any} size={22} color={iconColor} />
        </View>

        {countBg ? (
          <View
            style={[
              {
                backgroundColor: countBg,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              },
              countContainerStyle,
            ]}
          >
            <Text
              style={[
                {
                  fontSize: 14, // 👈 smaller count
                  fontWeight: "600",
                  color: countColor,
                },
                countTextStyle,
              ]}
            >
              {count}
            </Text>
          </View>
        ) : (
          <Text
            style={[
              {
                fontSize: 16, // 👈 smaller count
                fontWeight: "600",
                color: countColor,
              },
              countTextStyle,
            ]}
          >
            {count}
          </Text>
        )}
      </View>

      {/* SUBTITLE */}
      {subTitle ? (
        <Text
          style={[
            {
              marginTop: 8,
              fontSize: 16,
              color: subTitleColor,
            },
            subTitleStyle,
          ]}
        >
          {subTitle}
        </Text>
      ) : null}

      {/* TITLE */}
      <View style={{ marginTop: subTitle ? 6 : 8 }}>
        <Text
          style={[
            {
              fontSize: 14, // 👈 smaller title
              color: titleColor,
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
