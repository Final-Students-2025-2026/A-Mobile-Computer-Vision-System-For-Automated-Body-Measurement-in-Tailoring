const { withAndroidManifest } = require("@expo/config-plugins");

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function upsertUsesFeature(manifest) {
  const usesFeature = ensureArray(manifest["uses-feature"]);
  const existing = usesFeature.find(
    (entry) => entry?.$?.["android:name"] === "android.hardware.camera.ar",
  );

  if (!existing) {
    usesFeature.push({
      $: {
        "android:name": "android.hardware.camera.ar",
        "android:required": "false",
      },
    });
  }

  manifest["uses-feature"] = usesFeature;
}

function upsertArCoreMetaData(application) {
  const metaData = ensureArray(application["meta-data"]);
  const existing = metaData.find(
    (entry) => entry?.$?.["android:name"] === "com.google.ar.core",
  );

  if (!existing) {
    metaData.push({
      $: {
        "android:name": "com.google.ar.core",
        "android:value": "optional",
      },
    });
  }

  application["meta-data"] = metaData;
}

module.exports = function withArcore(config) {
  return withAndroidManifest(config, (manifestConfig) => {
    const manifest = manifestConfig.modResults.manifest;
    upsertUsesFeature(manifest);

    const application = ensureArray(manifest.application)[0] || {};
    upsertArCoreMetaData(application);
    manifest.application = [application];

    return manifestConfig;
  });
};
