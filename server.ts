import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- AUTH APIs ---
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    // In a real app, verify with Firebase Auth or DB
    // For now, we'll return a mock success based on role
    const role = email === 'mohandomale38@gmail.com' ? 'admin' : 'resident';
    res.json({ success: true, user: { email, role, name: "User" } });
  });

  app.post("/api/auth/register", (req, res) => {
    const { name, email, role } = req.body;
    res.json({ success: true, message: "User registered successfully", user: { name, email, role } });
  });

  // --- ADMIN APIs ---
  app.get("/api/admin/stats", (req, res) => {
    res.json({
      totalRooms: 45,
      occupiedRooms: 38,
      pendingPayments: 12,
      activeComplaints: 5,
      revenueTrends: [
        { name: 'Jan', amount: 45000 },
        { name: 'Feb', amount: 52000 },
        { name: 'Mar', amount: 48000 },
        { name: 'Apr', amount: 61000 },
      ]
    });
  });

  app.get("/api/admin/rooms", (req, res) => {
    // Return sample rooms
    res.json([
      { id: '1', number: '101', type: 'Single', rent: 12000, capacity: 1, occupancy: 1, status: 'Full' },
      { id: '2', number: '102', type: 'Double', rent: 8500, capacity: 2, occupancy: 1, status: 'Available' },
    ]);
  });

  app.post("/api/admin/rooms", (req, res) => {
    const room = req.body;
    res.json({ success: true, room: { ...room, id: Date.now().toString() } });
  });

  app.patch("/api/admin/complaints/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    res.json({ success: true, message: `Complaint ${id} updated to ${status}` });
  });

  // --- RESIDENT APIs ---
  app.get("/api/resident/dashboard/:userId", (req, res) => {
    res.json({
      room: { number: '102', type: 'Double', rent: 8500 },
      paymentStatus: 'Pending',
      lastPayment: { amount: 8500, date: '2024-03-05' },
      noticesCount: 3
    });
  });

  app.post("/api/resident/complaints", (req, res) => {
    const complaint = req.body;
    res.json({ success: true, complaint: { ...complaint, id: Date.now().toString(), status: 'Pending' } });
  });

  // --- NOTICES ---
  app.get("/api/notices", (req, res) => {
    res.json([
      { id: '1', title: 'Maintenance Notice', content: 'Water supply will be cut on Sunday.', priority: 'High' },
      { id: '2', title: 'Welcome!', content: 'Welcome to StayEase!', priority: 'Normal' }
    ]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
