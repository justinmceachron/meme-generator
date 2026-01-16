// imgBB Image Upload Utility
// Get your free API key from https://api.imgbb.com/

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

interface ImgBBResponse {
  success: boolean;
  data?: {
    url: string;
    display_url: string;
    delete_url: string;
  };
  error?: {
    message: string;
  };
}

export async function uploadToImgBB(base64Image: string): Promise<string> {
  if (!IMGBB_API_KEY || IMGBB_API_KEY === "your_api_key_here") {
    throw new Error("Please set your imgBB API key in .env.local (NEXT_PUBLIC_IMGBB_API_KEY)");
  }

  // Remove the data:image/png;base64, prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const formData = new FormData();
  formData.append("key", IMGBB_API_KEY);
  formData.append("image", base64Data);

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  const result: ImgBBResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || "Failed to upload image to imgBB");
  }

  return result.data.display_url;
}
