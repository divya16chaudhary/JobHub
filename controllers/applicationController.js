import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer not allowed to access this resource.", 400)
    );
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume File Required!", 400));
  }

  const {resume } = req.files;
  //console.log("files",req);
  

  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(
      new ErrorHandler("Invalid file type. Please upload a PNG file.", 400)
    );
  }

  // const handleUpload = async () => {
  //   const formData = new FormData();
  //   formData.append('file', resume.tempFilePath);
  //   formData.append('upload_preset', 'n56zuhfu'); // Replace with your upload preset
  //   formData.append('cloud_name', 'dk2y5sp91'); // Replace with your Cloudinary cloud name

  //   try {
  //     const response = await axios.post(
  //       'https://api.cloudinary.com/v1_1/dk2y5sp91/image/upload', // Replace with your Cloudinary cloud name
  //       formData
  //     );
  //   //  setImageUrl(response.data.secure_url); // The uploaded image URL
  //   return response.data.secure_url;
  //   } catch (error) {
  //     console.error('Error uploading the image:', error);
  //   }
  // };
  
  const urlImage=handleUpload();
  console.log(urlImage);
  
  
 /* const cloudinaryResponse = await cloudinary.uploader.upload(
    resume.tempFilePath       //cloudanary paraameter
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
  }
    */
  const { name, email, coverLetter, phone, address, jobId } = req.body;
  const applicantID = {
    user: req.user._id,
    role: "Job Seeker",
  };
  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }
  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const employerID = {
    user: jobDetails.postedBy,
    role: "Employer",
  };
  if (
    !name ||
    !email ||
    !coverLetter ||
    !phone ||
    !address ||
    !applicantID ||
    !employerID ||
    !resume          //agar isme se koi ek nahi mila to 
  ) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }
  const app={
    name:name,
    email:email,
    coverLetter:coverLetter,
    phone:phone,
    address:address,
    applicantID:applicantID,
    employerID:employerID,
    resume: {
      public_id: "jvhfkjnkflr",  //object which is provided by cloudinary
      url: "vhjkdfhgklrjgl",
  }
}
const newApp=await Application.create(app);
console.log(newApp);
  /*const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID,
    employerID,
    resume: {
      public_id: cloudinaryResponse.public_id,  //object which is provided by cloudinary
      url: cloudinaryResponse.secure_url,
    },
  });*/
  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    newApp,
  });
});

export const employerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "employerID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "applicantID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerDeleteApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted!",
    });
  }
);
