import { ImageFormat, PaintStyle, Skia } from '@shopify/react-native-skia';
import { Buffer } from 'buffer';
import ReactNativeBlobUtil from 'react-native-blob-util';

/**
 * Converts an image URL to black icon on white background PNG Base64.
 */
export async function toThermalBase64(
  url: string,
  threshold = 128,
): Promise<string> {
  const res = await ReactNativeBlobUtil.config({
    fileCache: false,
  }).fetch('GET', url);
  const base64 = res.base64();
  const buffer = Buffer.from(base64, 'base64');
  const data = new Uint8Array(buffer);

  const skData = Skia.Data.fromBytes(data);
  const image = Skia.Image.MakeImageFromEncoded(skData);
  if (!image) throw new Error('Failed to load image');

  const width = image.width();
  const height = image.height();

  const surface = Skia.Surface.Make(width, height);
  if (!surface) throw new Error('Failed to create surface');
  const canvas = surface.getCanvas();

  const pixels = image.readPixels();
  if (!pixels) throw new Error('Failed to read pixels');

  const paint = Skia.Paint();
  paint.setStyle(PaintStyle.Fill);

  const BLACK = Skia.Color('black');
  const WHITE = Skia.Color('white');

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      const gray = 0.3 * r + 0.59 * g + 0.11 * b;

      // Inverted: black icon, white background
      if (gray < threshold) {
        paint.setColor(WHITE); // icon
      } else {
        paint.setColor(BLACK); // background
      }

      canvas.drawRect({ x, y, width: 1, height: 1 }, paint);
    }
  }

  const snapshot = surface.makeImageSnapshot();
  const pngBase64 = snapshot.encodeToBase64(ImageFormat.PNG, 100);

  return `data:image/png;base64,${pngBase64}`;
}