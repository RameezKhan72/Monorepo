import { View, Text, Button } from "react-native";
import { router } from "expo-router";

export default function StudentsScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Students List</Text>
      <Button title="Mark Attendance" onPress={() => router.push("/MarkAttendanceScreen")} />
    </View>
  );
}
