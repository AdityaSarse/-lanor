require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");
const User     = require("./src/models/users.models");

const createAdmin = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error("❌ MONGO_URI is missing in Backend/.env");
        process.exit(1);
    }

    try {
        console.log("⏳ Connecting to MongoDB...");
        await mongoose.connect(mongoUri);
        console.log("✅ MongoDB Connected successfully!");

        const adminEmail = process.env.ADMIN_EMAIL || "admin@elanor.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345!";

        const existingUser = await User.findOne({ email: adminEmail });

        if (existingUser) {
            existingUser.role = "admin";
            const hashedPassword = await bcrypt.hash(adminPassword, 12);
            existingUser.password = hashedPassword;
            await existingUser.save();
            console.log(`🎉 Admin user updated successfully!`);
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Role: admin`);
        } else {
            const hashedPassword = await bcrypt.hash(adminPassword, 12);
            const newAdmin = await User.create({
                firstName: "System",
                lastName: "Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                emailVerified: true
            });
            console.log(`🎉 Admin user created successfully!`);
            console.log(`   ID: ${newAdmin._id}`);
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Role: ${newAdmin.role}`);
        }
    } catch (error) {
        console.error("❌ Failed to create/update admin user:", error.message || error);
    } finally {
        await mongoose.disconnect();
        console.log("👋 Database connection closed.");
        process.exit(0);
    }
};

createAdmin();
