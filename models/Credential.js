import mongoose from "mongoose";

const CredentialSchema = new mongoose.Schema({
  name: String,
  email: String,
  dob: String,
  phone: String,
  organization: String,
  address: String,
  credentialIssueDate: String,
  credentialNo: String,
  token: String, // Store the generated JWT token
});

export default mongoose.models.Credential || mongoose.model("Credential", CredentialSchema);
