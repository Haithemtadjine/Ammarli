import React, { forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary:       '#003366',
  secondary:     '#F3CD0D',
  white:         '#FFFFFF',
  inputBg:       '#F1F5F9',
  textSecondary: '#64748B',
  border:        '#E2E8F0',
  error:         '#E53935',
  success:       '#10B981',
};

export interface AmmarliInputProps extends TextInputProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  error?: string;
  isValid?: boolean;
  isPassword?: boolean;
}

const AmmarliInput = forwardRef<TextInput, AmmarliInputProps>((props, ref) => {
  const { label, iconName, error, isValid, isPassword, ...textInputProps } = props;

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputContainer, !!error && styles.inputError]}>
        
        {/* Text Input */}
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor="#94A3B8"
          secureTextEntry={isPassword}
          textAlign="right"
          {...textInputProps}
        />

        {/* Right Side (End): Main Icon */}
        <Ionicons name={iconName} size={20} color={COLORS.primary} style={styles.mainIcon} />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

export default AmmarliInput;

const styles = StyleSheet.create({
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontFamily: 'Cairo-Bold', fontSize: 14, color: COLORS.primary, marginBottom: 8, textAlign: 'right' },
  inputContainer: { flexDirection: 'row-reverse', height: 60, backgroundColor: COLORS.inputBg, borderRadius: 16, alignItems: 'center', paddingHorizontal: 15 },
  inputError: { borderWidth: 1, borderColor: COLORS.error },
  input: { flex: 1, fontFamily: 'Cairo-Regular', fontSize: 16, color: COLORS.primary },
  mainIcon: { marginLeft: 10 },
  errorText: { fontFamily: 'Cairo-Regular', fontSize: 12, color: COLORS.error, marginTop: 4, textAlign: 'right' },
});
