/* ROBOSCOPIA R2 media URL resolver — public read-only URLs only. */
(() => {
  "use strict";
  const config = window.ROBOSCOPIA_MEDIA_CONFIG || {};
  const baseUrl = typeof config.baseUrl === "string" ? config.baseUrl.trim() : "";
  const enabled = config.enabled === true && /^https:\/\//i.test(baseUrl);
  const allowedExtension = /\.(?:avif|webp|jpe?g|png|mp4|webm)$/i;

  function resolve(assetKey) {
    if (!enabled || typeof assetKey !== "string") return null;
    const key = assetKey.trim().replace(/^\/+/, "");
    if (!key || key.includes("..") || key.includes("\\") || !allowedExtension.test(key)) return null;
    if (!/^[a-zA-Z0-9._/-]+$/.test(key)) return null;
    const root = baseUrl.replace(/\/+$/, "") + "/";
    return root + key.split("/").map(encodeURIComponent).join("/");
  }

  window.RoboscopiaMedia = Object.freeze({ enabled, resolve });
})();
