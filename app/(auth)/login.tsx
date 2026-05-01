import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Button, Card } from "react-native-paper";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View
      style={{
        backgroundColor: "#EFEAE5",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
      }}
    >
      <Image
        source={require("../../assets/images/measure-ai logo.png")}
        style={{ width: 150, height: 150, marginBottom: 20 }}
        contentFit="contain"
      />
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          color: "#414C1D",
        }}
      >
        Measure AI
      </Text>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Login to your account
      </Text>

      {/*form section*/}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{
          width: "100%",
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 10,
          marginBottom: 10,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={{
          width: "100%",
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 10,
          marginBottom: 20,
        }}
      />

      <Button mode="contained" onPress={() => {}} style={{ width: "100%" }}>
        Login
      </Button>
    </View>
  );
}
