import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles as loginStyles } from "./login.styles";
import { useRouter } from "expo-router";

const styles = {
  ...loginStyles,
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    marginBottom: 20,
    color: "#000" as const,
  },
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Reset Password</Text>

        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#888"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.link}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
