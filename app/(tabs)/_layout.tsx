import { Tabs } from 'expo-router';
import React from 'react';
import { FlexAlignType, StyleSheet, Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors, SwapColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

// Import SVG icons
import AssetsIcon from '@/assets/images/icons/menu/assets.svg';
import AssetsHighlightedIcon from '@/assets/images/icons/menu/assetsHighlighted.svg';
import HomeIcon from '@/assets/images/icons/menu/home.svg';
import HomeHighlightedIcon from '@/assets/images/icons/menu/homeHighlighted.svg';
import ProfileIcon from '@/assets/images/icons/menu/profile.svg';
import ProfileHighlightedIcon from '@/assets/images/icons/menu/profileHighlighted.svg';
import PromotionsIcon from '@/assets/images/icons/menu/promotions.svg';
import PromotionsHighlightedIcon from '@/assets/images/icons/menu/promotionsHighlighted.svg';
import SupportIcon from '@/assets/images/icons/menu/support.svg';
import SupportHighlightedIcon from '@/assets/images/icons/menu/supportHighlighted.svg';

type TabRoute = 'index' | 'promotions' | 'support' | 'assets' | 'profile';
type TabIconKey = 'home' | 'promotions' | 'support' | 'assets' | 'profile';

const tabConfig: { name: TabRoute; title: string; iconKey: TabIconKey }[] = [
  { name: 'index', title: 'Home', iconKey: 'home' },
  { name: 'promotions', title: 'Promotions', iconKey: 'promotions' },
  { name: 'support', title: 'Support', iconKey: 'support' },
  { name: 'assets', title: 'Assets', iconKey: 'assets' },
  { name: 'profile', title: 'Profile', iconKey: 'profile' },
];

const iconMap = {
  home: { default: HomeIcon, highlighted: HomeHighlightedIcon },
  promotions: { default: PromotionsIcon, highlighted: PromotionsHighlightedIcon },
  support: { default: SupportIcon, highlighted: SupportHighlightedIcon },
  assets: { default: AssetsIcon, highlighted: AssetsHighlightedIcon },
  profile: { default: ProfileIcon, highlighted: ProfileHighlightedIcon },
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isMobile, width } = useWindowDimensions();
  const dynamicStyles = getDynamicTabStyles(isMobile, width);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: SwapColors.tabBarInactive,
        tabBarLabel: ({ focused, color, children }) =>
          focused ? null : (
            <Text style={[styles.tabLabel, dynamicStyles.tabLabel, { color }]}>{children}</Text>
          ),
        tabBarStyle: [styles.tabBar, dynamicStyles.tabBar],
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      {tabConfig.map(({ name, title, iconKey }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused }) => {
              const IconComponent = focused ? iconMap[iconKey].highlighted : iconMap[iconKey].default;
              const size = focused ? (isMobile ? 26 : 28) : (isMobile ? 22 : 24);
              return (
                <View style={[styles.iconWrapper, dynamicStyles.iconWrapper, focused && styles.iconWrapperActive]}>
                  <IconComponent width={size} height={size} />
                </View>
              );
            },
          }}
        />
      ))}
    </Tabs>
  );
}

function getDynamicTabStyles(isMobile: boolean, width: number) {
  return {
    tabBar: {
      height: isMobile ? 84 : 96,
      paddingVertical: isMobile ? 10 : 12,
      paddingHorizontal: isMobile ? 20 : Math.min(40, (width - 600) / 2),
      maxWidth: isMobile ? undefined : 600,
      alignSelf: (isMobile ? 'stretch' : 'center') as FlexAlignType,
      width: '100%' as const,
    },
    tabLabel: {
      fontSize: isMobile ? 12 : 13,
      marginTop: isMobile ? 4 : 6,
      marginBottom: isMobile ? 6 : 8,
    },
    iconWrapper: {
      width: isMobile ? 46 : 52,
      height: isMobile ? 46 : 52,
      borderRadius: isMobile ? 14 : 16,
    },
  };
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: SwapColors.tabBarBackground,
    borderTopWidth: 0,
    paddingVertical: 10,
    height: 84,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 6,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: SwapColors.accent,
  },
});
