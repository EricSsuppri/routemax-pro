import { registerPlugin } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";

/**
 * Bridge to the native ScreenshotWatcher plugin (see android-custom/).
 * startWatching(): starts the foreground service that observes MediaStore
 *   for new screenshots. stopWatching(): stops it.
 * Event "screenshotDetected": { imageBase64 } — downscaled JPEG, base64.
 */
export interface ScreenshotWatcherPlugin {
  startWatching(): Promise<void>;
  stopWatching(): Promise<void>;
  addListener(
    eventName: "screenshotDetected",
    listenerFunc: (data: { imageBase64: string }) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
}

export const ScreenshotWatcher =
  registerPlugin<ScreenshotWatcherPlugin>("ScreenshotWatcher");
