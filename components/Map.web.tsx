import React from 'react';
import { Image, StyleSheet } from 'react-native';

export function UrlTile(props: any) { return null; }
export function Marker(props: any) { return null; }
export function Circle(props: any) { return null; }
export function Polyline(props: any) { return null; }

export default function MapView(props: any) {
  // Use a reliable placeholder for web since react-native-maps doesn't support web without extra config
  return (
    <Image 
      source={{ uri: 'https://placehold.co/800x800/EAECEE/002147?font=roboto&text=Map+Preview%0A(Use+Mobile+App+for+Full+Interactivity)' }}
      style={[StyleSheet.absoluteFillObject, props.style]}
    />
  );
}
