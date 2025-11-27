import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Animated,
  FlexAlignType,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import tokenData from '@/assets/assets-token.json';
import { SwapColors } from '@/constants/theme';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

// Import token SVG icons
import BtcIcon from '@/assets/images/icons/tokens/btc.svg';
import DogeIcon from '@/assets/images/icons/tokens/doge.svg';
import EthIcon from '@/assets/images/icons/tokens/eth.svg';
import UcoinIcon from '@/assets/images/icons/tokens/ucoin.svg';
import UsdcIcon from '@/assets/images/icons/tokens/usdc.svg';
import UsdtIcon from '@/assets/images/icons/tokens/usdt.svg';

const tokens = {
  wbtc: {
    name: 'WBTC',
    symbol: 'WBTC',
    balance: '0.005',
    usdValue: '110554.89',
  },
  usd: {
    name: 'USD',
    symbol: 'USD',
    balance: '321.33',
    usdValue: '1.00',
  },
};

function getDynamicStyles(isMobile: boolean, width: number) {
  return {
    container: {
      paddingHorizontal: isMobile ? 20 : Math.min(40, (width - 600) / 2),
      maxWidth: isMobile ? undefined : 600,
      alignSelf: (isMobile ? 'stretch' : 'center') as FlexAlignType,
      width: '100%' as const,
    },
    header: {
      marginBottom: isMobile ? 24 : 32,
    },
    headerTitle: {
      fontSize: isMobile ? 26 : 32,
    },
    swapCard: {
      padding: isMobile ? 20 : 28,
      borderRadius: isMobile ? 24 : 28,
    },
    feeRow: {
      marginTop: isMobile ? 24 : 32,
    },
    disclaimer: {
      fontSize: isMobile ? 13 : 14,
      lineHeight: isMobile ? 18 : 20,
    },
    previewButton: {
      marginTop: isMobile ? 24 : 32,
      paddingVertical: isMobile ? 16 : 18,
    },
    previewButtonText: {
      fontSize: isMobile ? 16 : 18,
    },
  };
}

function getRowDynamicStyles(isMobile: boolean) {
  return {
    sectionLabel: {
      fontSize: isMobile ? 16 : 18,
    },
    balanceLabel: {
      fontSize: isMobile ? 14 : 15,
    },
    tokenName: {
      fontSize: isMobile ? 15 : 16,
    },
    amountText: {
      fontSize: isMobile ? 32 : 36,
    },
  };
}

export default function HomeScreen() {
  const { isMobile, width } = useWindowDimensions();
  const dynamicStyles = getDynamicStyles(isMobile, width);
  const [fromToken, setFromToken] = useState({ ...tokens.wbtc, usdValue: '110554.89' });
  const [toToken, setToToken] = useState({ ...tokens.usd, usdValue: '1.00' });
  const [fromAmount, setFromAmount] = useState('0.005');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectingFor, setSelectingFor] = useState<'from' | 'to'>('from');
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  // Calculate toAmount based on usdValue
  const calculateToAmount = (): string => {
    if (!fromAmount || fromAmount === '') {
      return '0';
    }
    const fromValue = parseFloat(fromAmount);
    if (isNaN(fromValue)) {
      return '0';
    }
    if (fromValue === 0) {
      return '0';
    }
    const fromUsdValue = parseFloat(fromToken.usdValue);
    const toUsdValue = parseFloat(toToken.usdValue);
    const result = (fromValue * fromUsdValue) / toUsdValue;
    return result.toFixed(5);
  };

  const toAmount = calculateToAmount();

  // Validate if preview button should be enabled
  const isPreviewEnabled = (): boolean => {
    if (!fromAmount || fromAmount === '') {
      return false;
    }
    const fromValue = parseFloat(fromAmount);
    const balance = parseFloat(fromToken.balance);
    return fromValue > 0 && fromValue <= balance;
  };

  const previewEnabled = isPreviewEnabled();

  const handleMaxPress = () => {
    setFromAmount(fromToken.balance);
  };

  const handleSwap = () => {
    // 交换 token
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    // 交换 amount
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
  };

  const openTokenModal = (forType: 'from' | 'to') => {
    setSelectingFor(forType);
    setShowTokenModal(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const closeTokenModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowTokenModal(false);
    });
  };

  const selectToken = (token: typeof tokenData[0]) => {
    const tokenObj = {
      name: token.symbol,
      symbol: token.symbol,
      balance: token.balance,
      usdValue: token.usdValue,
    };

    if (selectingFor === 'from') {
      setFromToken(tokenObj);
      setFromAmount(''); // Reset From input when token changes
    } else {
      setToToken(tokenObj);
    }
    closeTokenModal();
  };

  const getTokenIcon = (symbol: string) => {
    const iconMap: Record<string, React.ComponentType<{ width?: number; height?: number }>> = {
      WBTC: BtcIcon,
      ETH: EthIcon,
      USDT: UsdtIcon,
      USDC: UsdcIcon,
      DOGE: DogeIcon,
      UCOIN: UcoinIcon,
    };

    const currencyMap: Record<string, any> = {
      USD: require('@/assets/images/icons/currencies/usd.png'),
      JPY: require('@/assets/images/icons/currencies/jpy.png'),
      HKD: require('@/assets/images/icons/currencies/hkd.png'),
      GBP: require('@/assets/images/icons/currencies/gbp.png'),
      CNY: require('@/assets/images/icons/currencies/rmb.png'),
      EUR: require('@/assets/images/icons/currencies/eur.png'),
    };

    if (iconMap[symbol]) {
      const IconComponent = iconMap[symbol];
      return <IconComponent width={20} height={20} />;
    }

    if (currencyMap[symbol]) {
      return <Image source={currencyMap[symbol]} style={{ width: 20, height: 20 }} resizeMode="contain" />;
    }

    return null;
  };

  const handleAmountChange = (value: string) => {

    if (value === '') {
      setFromAmount('0');
      return;
    }

    let processedValue = value;
    if (value.startsWith('.')) {
      processedValue = '0' + value;
    }

    const regex = /^\d*\.?\d{0,3}$/;
    if (regex.test(processedValue)) {
      setFromAmount(processedValue);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={[styles.container, dynamicStyles.container]}>
        <View style={[styles.header, dynamicStyles.header]}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Swap</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.swapCard, dynamicStyles.swapCard]}>
          <SwapRow
            label="From"
            token={fromToken}
            amount={fromAmount}
            onAmountChange={handleAmountChange}
            showMax
            onMaxPress={handleMaxPress}
            rate={`Balance: ${fromToken.balance}`}
            isMobile={isMobile}
            editable
            onTokenPress={() => openTokenModal('from')}
            getTokenIcon={getTokenIcon}
          />

          <View style={styles.swapDivider}>
            <View style={styles.dividerLine} />
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.swapIconContainer}
              onPress={handleSwap}>
              <Ionicons name="swap-vertical" size={18} color="#f7f7f7" />
            </TouchableOpacity>
            <View style={styles.dividerLine} />
          </View>

          <SwapRow
            label="To"
            token={toToken}
            amount={toAmount}
            rate={`Balance: ${toToken.balance}`}
            exchangeRate={`1 ${fromToken.name}: ${(parseFloat(fromToken.usdValue) / parseFloat(toToken.usdValue)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toToken.name}`}
            isMobile={isMobile}
            onTokenPress={() => openTokenModal('to')}
            getTokenIcon={getTokenIcon}
          />
        </View>

        <SelectTokenModal
          visible={showTokenModal}
          onClose={closeTokenModal}
          onSelect={selectToken}
          slideAnim={slideAnim}
          isMobile={isMobile}
        />

        <View style={[styles.feeRow, dynamicStyles.feeRow]}>
          <Text style={styles.feeLabel}>Fee:</Text>
          <Text style={styles.feeValue}>Waived</Text>
        </View>

        <Text style={[styles.disclaimer, dynamicStyles.disclaimer]}>
          * Exchange rates may vary with market changes. Final amounts depend on current rates and
          are not guaranteed. Users accept the risk of rate fluctuations.
        </Text>

        <TouchableOpacity
          style={[
            styles.previewButton,
            dynamicStyles.previewButton,
            !previewEnabled && styles.previewButtonDisabled,
          ]}
          activeOpacity={previewEnabled ? 0.85 : 1}
          disabled={!previewEnabled}>
          <Text
            style={[
              styles.previewButtonText,
              dynamicStyles.previewButtonText,
              !previewEnabled && styles.previewButtonTextDisabled,
            ]}>
            {previewEnabled ? 'Preview' : 'Incorrect Order'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

type SwapRowProps = {
  label: string;
  token: { name: string; symbol: string; usdValue?: string; balance?: string };
  amount: string;
  rate: string;
  showMax?: boolean;
  onMaxPress?: () => void;
  editable?: boolean;
  onAmountChange?: (value: string) => void;
  onTokenPress?: () => void;
  getTokenIcon?: (symbol: string) => React.ReactNode;
  isMobile: boolean;
  exchangeRate?: string;
};

function SwapRow({
  label,
  token,
  amount,
  rate,
  showMax,
  onMaxPress,
  editable = false,
  onAmountChange,
  onTokenPress,
  getTokenIcon,
  isMobile,
  exchangeRate,
}: SwapRowProps) {
  const dynamicStyles = getRowDynamicStyles(isMobile);
  return (
    <View style={styles.swapRow}>
      <View style={styles.swapRowHeader}>
        <Text style={[styles.sectionLabel, dynamicStyles.sectionLabel]}>{label}</Text>
        <Text style={[styles.balanceLabel, dynamicStyles.balanceLabel]}>{rate}</Text>
      </View>
      <View style={styles.swapRowContent}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.tokenPill}
          onPress={onTokenPress}>
          {getTokenIcon && getTokenIcon(token.symbol)}
          <Text style={[styles.tokenName, dynamicStyles.tokenName]}>{token.name}</Text>
          <Ionicons name="chevron-down" size={16} color="#fff" />
        </TouchableOpacity>
        <View style={styles.amountContainer}>
          {editable ? (
            <View style={styles.amountInputWrapper}>
              <TextInput
                style={[styles.amountText, dynamicStyles.amountText, styles.amountInput]}
                value={amount}
                onChangeText={onAmountChange}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={SwapColors.textMuted}
                selectTextOnFocus
              />
              {showMax && (
                <TouchableOpacity activeOpacity={0.85} style={styles.maxBadge} onPress={onMaxPress}>
                  <Text style={styles.maxText}>MAX</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={[styles.amountText, dynamicStyles.amountText]}>{amount}</Text>
          )}
          {exchangeRate && (
            <View style={styles.exchangeRateContainer}>
              <Text style={styles.exchangeRateText}>{exchangeRate}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    paddingTop: 12,
    backgroundColor: SwapColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: SwapColors.textPrimary,
    fontSize: 16,
    marginLeft: 4,
  },
  headerTitle: {
    color: SwapColors.textPrimary,
    fontSize: 26,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  swapCard: {
    backgroundColor: SwapColors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f7f7f7',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 32,
    elevation: 22,
  },
  swapRow: {
    marginBottom: 12,
  },
  swapRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabel: {
    color: SwapColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  balanceLabel: {
    color: SwapColors.textMuted,
    fontSize: 14,
  },
  swapRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 8,
  },
  tokenName: {
    color: SwapColors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: 12,
  },
  amountInputWrapper: {
    alignItems: 'flex-end',
    maxWidth: '100%',
  },
  amountText: {
    color: SwapColors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'right',
  },
  amountInput: {
    minWidth: 100,
    maxWidth: '100%',
    textAlign: 'right',
    flexShrink: 1,
  },
  maxBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: SwapColors.accentStrong,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: SwapColors.accentSoft,
  },
  maxText: {
    color: SwapColors.accentStrong,
    fontWeight: '800',
    fontSize: 12,
  },
  exchangeRateContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  exchangeRateText: {
    color: SwapColors.textMuted,
    fontSize: 14,
  },
  swapDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2c2c2e',
  },
  swapIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#050505',
    borderWidth: 1.5,
    borderColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
  },
  feeLabel: {
    color: SwapColors.textMuted,
    fontSize: 14,
  },
  feeValue: {
    color: SwapColors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimer: {
    color: SwapColors.disclaimer,
    fontSize: 13,
    lineHeight: 18,
  },
  previewButton: {
    marginTop: 24,
    backgroundColor: SwapColors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  previewButtonDisabled: {
    backgroundColor: '#2c2c2e',
  },
  previewButtonText: {
    color: '#0b0b0b',
    fontSize: 16,
    fontWeight: '700',
  },
  previewButtonTextDisabled: {
    color: '#8c8c8c',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: SwapColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '65%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  modalHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    color: SwapColors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  tokenList: {
    paddingHorizontal: 20,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2c2c2e',
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenFullName: {
    color: SwapColors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  tokenSymbol: {
    color: SwapColors.textMuted,
    fontSize: 14,
  },
  tokenAmount: {
    alignItems: 'flex-end',
  },
  tokenBalance: {
    color: SwapColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tokenValue: {
    color: SwapColors.textMuted,
    fontSize: 13,
  },
});

type SelectTokenModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (token: typeof tokenData[0]) => void;
  slideAnim: Animated.Value;
  isMobile: boolean;
};

function SelectTokenModal({ visible, onClose, onSelect, slideAnim, isMobile }: SelectTokenModalProps) {
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const getTokenIcon = (symbol: string) => {
    const iconMap: Record<string, React.ComponentType<{ width?: number; height?: number }>> = {
      WBTC: BtcIcon,
      ETH: EthIcon,
      USDT: UsdtIcon,
      USDC: UsdcIcon,
      DOGE: DogeIcon,
      UCOIN: UcoinIcon,
    };

    const currencyMap: Record<string, any> = {
      USD: require('@/assets/images/icons/currencies/usd.png'),
      JPY: require('@/assets/images/icons/currencies/jpy.png'),
      HKD: require('@/assets/images/icons/currencies/hkd.png'),
      GBP: require('@/assets/images/icons/currencies/gbp.png'),
      CNY: require('@/assets/images/icons/currencies/rmb.png'),
      EUR: require('@/assets/images/icons/currencies/eur.png'),
    };

    if (iconMap[symbol]) {
      const IconComponent = iconMap[symbol];
      return <IconComponent width={40} height={40} />;
    }

    if (currencyMap[symbol]) {
      return <Image source={currencyMap[symbol]} style={{ width: 40, height: 40 }} resizeMode="contain" />;
    }

    return <Text style={{ fontSize: 20 }}>{symbol}</Text>;
  };

  const formatValue = (usdValue: string): string => {
    const value = parseFloat(usdValue);
    if (value >= 1) {
      return `≈ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `≈ $ ${value.toFixed(3)}`;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY }],
            },
          ]}
          onStartShouldSetResponder={() => true}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Token</Text>
          </View>
          <ScrollView style={styles.tokenList} showsVerticalScrollIndicator>
            {tokenData.map((token) => (
              <TouchableOpacity
                key={token.id}
                activeOpacity={0.7}
                style={styles.tokenItem}
                onPress={() => onSelect(token)}>
                <View style={styles.tokenIcon}>
                  {getTokenIcon(token.symbol)}
                </View>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenFullName}>{token.name}</Text>
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                </View>
                <View style={styles.tokenAmount}>
                  <Text style={styles.tokenBalance}>{token.balance}</Text>
                  <Text style={styles.tokenValue}>{formatValue(token.usdValue)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}
