import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // file has been uploaded successfully
        // console.log(
        //     "File has been uploaded successfully on cloudinary : ",
        //     response
        // );
        fs.unlinkSync(localFilePath); // remove file from local directory as it is uploaded on cloudinary
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove file from local directory as it is not uploaded on cloudinary i.e. upload operation failed
    }
};
const deleteFromCloudinary = async (publicId, resourceType) => {
    try {
        if (!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId, {
            invalidate: true,
            resource_type: resourceType,
        });

        return response;
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
