import { v2 as cloudinary } from 'cloudinary';
import { apiResponse } from '../../../../lib/apiResponse';
import { apiErrorResponse } from '../../../../lib/apiError';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth.middleware';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function signCloudinaryRequest(req: AuthenticatedRequest) {
  try {
    const timestamp = Math.round((new Date).getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      process.env.CLOUDINARY_API_SECRET!
    );

    return apiResponse({ timestamp, signature }, "Signature generated successfully", 200);
  } catch (error) {
    return apiErrorResponse(error, "Failed to generate Cloudinary signature");
  }
}

export const GET = withAuth(signCloudinaryRequest);
