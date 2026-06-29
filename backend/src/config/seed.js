import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import logger from "../utils/logger.js";

const seedDatabase = async () => {
  try {
    // 1. Seed Admin
    const adminEmail = "admin@launchpad.dev";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      admin = await User.create({
        googleId: "seed_admin_google_id",
        name: "Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        staffVerified: false,
        isActive: true,
      });
      logger.info(`[Seed] Seeded Admin account: ${adminEmail}`);
    }

    // 2. Seed Recruiter
    const recruiterEmail = "recruiter@techcorp.com";
    let recruiter = await User.findOne({ email: recruiterEmail });
    if (!recruiter) {
      const hashedPassword = await bcrypt.hash("Recruiter@123", 10);
      recruiter = await User.create({
        googleId: "seed_recruiter_google_id",
        name: "Standard Recruiter",
        email: recruiterEmail,
        password: hashedPassword,
        role: "RECRUITER",
        staffVerified: true,
        isActive: true,
      });
      logger.info(`[Seed] Seeded Recruiter account: ${recruiterEmail}`);
    }

    // 3. Seed Student (for project ownership)
    const studentEmail = "student@test.com";
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      const hashedPassword = await bcrypt.hash("Student@123", 10);
      student = await User.create({
        googleId: "seed_student_google_id",
        name: "Test Student",
        email: studentEmail,
        password: hashedPassword,
        role: "STUDENT",
        staffVerified: false,
        isActive: true,
        bio: "Full Stack Developer interested in building distributed systems.",
        university: "Faculty of Computing",
        department: "Computer Science",
        graduationYear: 2026,
      });
      logger.info(`[Seed] Seeded Student account: ${studentEmail}`);
    }

    // 4. Seed 3 Approved Projects
    const approvedProjectsCount = await Project.countDocuments({ status: "APPROVED" });
    if (approvedProjectsCount === 0) {
      const sampleProjects = [
        {
          owner: student._id,
          title: "E-Commerce Microservices Platform",
          description: "A highly scalable cloud-native e-commerce application built using a microservices architecture. It leverages Node.js services, Docker containers, RabbitMQ for messaging, and MongoDB for decentralized storage. Features include real-time shopping cart synchronization, structured order processing, and payment gateway simulations.",
          coverImage: "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=600",
          images: [
            "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=600",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600"
          ],
          techStack: ["Node.js", "Docker", "MongoDB", "RabbitMQ", "React"],
          demoLink: "https://shop-demo.example.com",
          githubLink: "https://github.com/example/shop-microservices",
          category: "Web Development",
          status: "APPROVED",
          likeCount: 42,
          viewCount: 156,
        },
        {
          owner: student._id,
          title: "Pneumonia Diagnostic AI Engine",
          description: "An advanced machine learning medical diagnosis engine powered by a Convolutional Neural Network (CNN) built in PyTorch. The model was trained on thousands of chest X-ray images to identify signs of bacterial and viral pneumonia with over 94% validation accuracy. Displays heatmap activations in the UI.",
          coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600",
          images: [
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600",
            "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=600"
          ],
          techStack: ["Python", "PyTorch", "Flask", "React", "Docker"],
          demoLink: "https://pneumo-ai.example.com",
          githubLink: "https://github.com/example/pneumo-xray-cnn",
          category: "AI/ML",
          status: "APPROVED",
          likeCount: 68,
          viewCount: 284,
        },
        {
          owner: student._id,
          title: "LaunchPad Collaborative Canvas",
          description: "A real-time shared virtual workspace application designed to help agile software development teams run remote planning sessions. Features a low-latency socket server connecting multiple whiteboard sketchpads, post-it note editors, and interactive user votes.",
          coverImage: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600",
          images: [
            "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600",
            "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600"
          ],
          techStack: ["Socket.io", "React", "Node.js", "Express", "TailwindCSS"],
          demoLink: "https://canvas.example.com",
          githubLink: "https://github.com/example/collab-whiteboard",
          category: "Mobile App",
          status: "APPROVED",
          likeCount: 29,
          viewCount: 94,
        }
      ];

      await Project.create(sampleProjects);
      logger.info(`[Seed] Seeded 3 approved sample projects successfully`);
    }
  } catch (error) {
    logger.error(`[Seed Error] Failed to seed database: ${error.message}`, { stack: error.stack });
  }
};

export default seedDatabase;
