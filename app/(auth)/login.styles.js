import { StyleSheet } from "react-native";

const PRIMARY = "#B7F34A"; // neon green
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",

    padding: 20,
  },
  wrappersmall: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  // Logo
  logoBox: {
    width: 100,
    height: 100,

    marginBottom: 30,
  },

  // Card
  card: {
    backgroundColor: "#0B0B0B",
    borderRadius: 24,
    padding: 20,

    // glow effect
    borderWidth: 1,
    borderColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },

  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: "#fff",
    marginBottom: 14,
  },

  button: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#000",
    fontWeight: "600",
  },

  forgot: {
    color: "#9A9A9A",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#222",
    marginVertical: 12,
    width: "40%",
    alignSelf: "center",
  },

  googleBtn: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    flexDirection: "row",
    alignitems: "center",
    justifyContent: "center",
  },
  googleText: {
    color: "#fff",
    fontSize: 13,
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  signupText: {
    color: "#9A9A9A",
    fontSize: 12,
  },
  signupLink: {
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 12,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 999,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  passwordInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 14,
  },

  eye: {
    fontSize: 18,
  },
  privacy: {
    color: "#6B7280",
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
  },

  row: { flexDirection: "row", justifyContent: "center", marginTop: 14 },
  muted: { color: "#9A9A9A" },
  link: { color: PRIMARY, fontWeight: "600" },
});

export { styles };
