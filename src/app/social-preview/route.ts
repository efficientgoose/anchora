import { createSocialImage } from "@/lib/social-image";

export const dynamic = "force-static";

export async function GET() {
  return createSocialImage();
}
