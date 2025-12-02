import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function OfferCard({ offer, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ borderWidth:1, padding:12, borderRadius:8, marginBottom:8 }}>
      <Text style={{ fontSize:16, fontWeight:'600' }}>{offer.title}</Text>
      <Text>{offer.category} • {offer.duration} min</Text>
      <Text style={{ marginTop:6 }}>Tutor: {offer.user}</Text>
    </TouchableOpacity>
  );
}
