export interface ClothingDetection {
  clothingType: string;
  color: string;
}

const CLOTHING_TYPES = ["shirt", "t-shirt", "jeans", "jacket", "dress", "sweater", "shoes"];
const COLORS = ["black", "white", "blue", "beige", "green", "red", "gray"];

export async function detectClothing(_imageBuffer: Buffer): Promise<ClothingDetection> {
  return {
    clothingType: CLOTHING_TYPES[Math.floor(Math.random() * CLOTHING_TYPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}
