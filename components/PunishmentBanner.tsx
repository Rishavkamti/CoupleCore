import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Punishment } from '../lib/types';
import { colors, radius } from '../lib/theme';

interface Props {
  punishment: Punishment;
  onPress: () => void;
  onComplete: () => void;
}

export default function PunishmentBanner({ punishment, onPress, onComplete }: Props) {
  return (
    <TouchableOpacity style={styles.banner} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.iconWrap}>
        <Text style={styles.emoji}>{punishment.emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.tag}>⚡ PUNISHMENT ACTIVE</Text>
        <Text style={styles.title}>{punishment.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {punishment.description}
        </Text>
      </View>
      <TouchableOpacity style={styles.doneBtn} onPress={onComplete}>
        <Ionicons name="checkmark" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.punish + '22',
    borderWidth: 1,
    borderColor: colors.punish + '66',
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.punish + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  body: {
    flex: 1,
  },
  tag: {
    color: colors.punish,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  desc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  doneBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.punish,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
