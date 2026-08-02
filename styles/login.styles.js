import { StyleSheet } from "react-native";

const PRIMARY = "#B7F34A"; // neon green

const createLoginStyles = (theme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme?.authBackground || "#000",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  authScrollContent: {
    flexGrow: 1,
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
    backgroundColor: theme?.surface || "#0B0B0B",
    borderRadius: 24,
    padding: 20,
    width: "100%",
    maxWidth: 420,

    // glow effect
    borderWidth: 1,
    borderColor: theme?.primary || PRIMARY,
    shadowColor: theme?.primary || PRIMARY,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },

  input: {
    backgroundColor: theme?.input || "#2A2A2A",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: theme?.text || "#fff",
    marginBottom: 14,
  },

  button: {
    backgroundColor: theme?.primary || PRIMARY,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: theme?.primaryText || "#000",
    fontWeight: "600",
  },

  title: {
    color: theme?.text || "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  helperText: {
    color: theme?.muted || "#9A9A9A",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 18,
  },

  forgot: {
    color: theme?.muted || "#9A9A9A",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: theme?.border || "#222",
    marginVertical: 12,
    width: "40%",
    alignSelf: "center",
  },

  googleBtn: {
    backgroundColor: theme?.input || "#2A2A2A",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  googleIcon: {
    width: 16,
    height: 16,
    marginRight: 12,
  },
  googleText: {
    color: theme?.text || "#fff",
    fontSize: 13,
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  signupText: {
    color: theme?.muted || "#9A9A9A",
    fontSize: 12,
  },
  signupLink: {
    color: theme?.primary || PRIMARY,
    fontWeight: "600",
    fontSize: 12,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme?.input || "#2A2A2A",
    borderRadius: 999,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  passwordInput: {
    flex: 1,
    color: theme?.text || "#fff",
    paddingVertical: 14,
  },

  eye: {
    fontSize: 18,
  },
  privacy: {
    color: theme?.muted || "#6B7280",
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
  },

  row: { flexDirection: "row", justifyContent: "center", marginTop: 14 },
  muted: { color: theme?.muted || "#9A9A9A" },
  link: { color: theme?.primary || PRIMARY, fontWeight: "600" },
  error: {
    color: theme?.danger || "#ff6b6b",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  success: {
    color: theme?.primary || PRIMARY,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
});

const styles = createLoginStyles();

export { styles, createLoginStyles };