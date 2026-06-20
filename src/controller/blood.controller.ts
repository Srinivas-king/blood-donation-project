import { Request, Response } from 'express';
import { BloodModel, Donor } from '../model/blood.model';
import { pool } from '../db/db'; // ✅ Added for Login
import { RowDataPacket } from 'mysql2';    // ✅ Added for Login
import { NotificationService } from '../service/notification.service';

export class BloodController {

    // 1. REGISTER DONOR
    static async register(req: Request, res: Response) {
        try {
            const {
                student_id, name, mobile_number, blood_group, branch,
                age, gender, college_name, last_donation_date, address, password
            } = req.body;

            // Validation
            if (!student_id || !name || !mobile_number || !blood_group || !college_name || !password) {
                res.status(400).json({ message: "Name, ID, Mobile, Blood Group, College & Password are required!" });
                return;
            }

            const newDonor: Donor = {
                student_id, name, mobile_number, blood_group, branch,
                age: Number(age), gender, college_name, last_donation_date, address,
                password: password // Saving Password
            };

            const result = await BloodModel.create(newDonor);
            res.status(201).json({ message: "Donor registered successfully", id: result.insertId });
        } catch (error: any) {
            console.error(error);
            if (error && error.code === 'ER_DUP_ENTRY') {
                res.status(409).json({ message: "This Student ID is already registered!" });
                return;
            }
            res.status(500).json({ message: "Registration failed", error: error.message });
        }
    }

    // ✅ 2. DONOR LOGIN (NEW FEATURE)
    static async login(req: Request, res: Response) {
        try {
            const { student_id, password } = req.body;

            // 1. Check input
            if (!student_id || !password) {
                res.status(400).json({ message: "Student ID and Password are required!" });
                return;
            }

            // 2. Check Database
            const [rows] = await pool.execute<RowDataPacket[]>(
                "SELECT * FROM donors WHERE student_id = ? AND password = ?",
                [student_id, password]
            );

            if (rows.length > 0) {
                const donor = rows[0];
                // Success: Send details (Exclude password for safety)
                res.status(200).json({
                    message: "Login Successful",
                    donor: {
                        id: donor.id,
                        name: donor.name,
                        student_id: donor.student_id,
                        mobile_number: donor.mobile_number,
                        blood_group: donor.blood_group,
                        branch: donor.branch,
                        age: donor.age,
                        college_name: donor.college_name,
                        last_donation_date: donor.last_donation_date,
                        gender: donor.gender,
                        address: donor.address
                    }
                });
            } else {
                res.status(401).json({ message: "Invalid Student ID or Password" });
            }

        } catch (error: any) {
            console.error(error);
            res.status(500).json({ message: "Login failed", error: error.message });
        }
    }

    // 3. GET ALL DONORS
    static async getAll(req: Request, res: Response) {
        try {
            const donors = await BloodModel.findAll();
            res.status(200).json(donors);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ message: "Error fetching data", error: error.message });
        }
    }

    // 4. DELETE DONOR (Admin Only)
    static async deleteDonor(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const result = await BloodModel.deleteById(id);

            if (result.affectedRows > 0) {
                res.status(200).json({ message: "Donor Deleted Successfully", success: true });
            } else {
                res.status(404).json({ message: "Donor not found", success: false });
            }
        } catch (error: any) {
            console.error("Delete Error:", error);
            res.status(500).json({ message: "Error deleting donor", error: error.message });
        }
    }

    // 5. ADMIN LOGIN
    static async adminLogin(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            const validUser = process.env.ADMIN_USER;
            const validPass = process.env.ADMIN_PASS;

            if (username === validUser && password === validPass) {
                res.status(200).json({ message: "Login Successful", success: true });
            } else {
                res.status(401).json({ error: "Invalid Username or Password", success: false });
            }
        } catch (error) {
            res.status(500).json({ error: "Server Error" });
        }
    }

    // 6. CONTACT FORM
    static async contact(req: Request, res: Response) {
        try {
            await BloodModel.saveContactMessage(req.body);
            res.status(200).json({ message: "Message sent successfully" });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ message: "Failed to send message", error: error.message });
        }
    }

    // 7. UPDATE DONOR
    static async updateDonor(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const { name, mobile_number, blood_group, branch, age, college_name } = req.body;

            // Validation
            if (!name || !mobile_number || !blood_group || !branch || !age || !college_name) {
                res.status(400).json({ message: "Name, Phone, Blood Group, Branch, Age & College are required!" });
                return;
            }

            const result = await BloodModel.update(id, req.body);
            if (result.affectedRows > 0) {
                res.status(200).json({ message: "Profile Updated Successfully" });
            } else {
                res.status(404).json({ message: "Donor not found" });
            }
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ message: "Update failed", error: error.message });
        }
    }

    // 8. CREATE BLOOD REQUEST
    static async createBloodRequest(req: Request, res: Response) {
        try {
            const { donor_id, requester_name, requester_phone, hospital_name, blood_group, location, message } = req.body;
            
            if (!donor_id || !requester_name || !requester_phone || !hospital_name || !blood_group || !location || !message) {
                res.status(400).json({ message: "All fields are required!" });
                return;
            }

            const result = await BloodModel.createRequest({
                donor_id: Number(donor_id),
                requester_name,
                requester_phone,
                hospital_name,
                blood_group,
                location,
                message
            });

            // Phase 2 Notification Hook (Future integration stubs)
            try {
                await NotificationService.sendSMSNotification(
                    requester_phone,
                    `Your blood request for group ${blood_group} has been submitted successfully.`
                );
                await NotificationService.sendRealTimeNotification(
                    donor_id,
                    `New incoming blood request from ${requester_name} for blood group ${blood_group}.`
                );
            } catch (err) {
                console.error("Notification trigger failed:", err);
            }

            res.status(201).json({ message: "Blood request submitted successfully", id: result.insertId });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ message: "Failed to submit request", error: error.message });
        }
    }

    // 9. GET REQUESTS FOR DONOR
    static async getDonorRequests(req: Request, res: Response) {
        try {
            const donorId = Number(req.params.id);
            const requests = await BloodModel.findRequestsByDonorId(donorId);
            res.status(200).json(requests);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ message: "Failed to fetch donor requests", error: error.message });
        }
    }

    // 10. GET REQUESTS FOR REQUESTER
    static async getRequesterRequests(req: Request, res: Response) {
        try {
            const phone = String(req.query.phone || '');
            if (!phone) {
                res.status(400).json({ message: "Phone number is required!" });
                return;
            }
            const requests = await BloodModel.findRequestsByRequesterPhone(phone);
            res.status(200).json(requests);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ message: "Failed to fetch requester requests", error: error.message });
        }
    }

    // 11. UPDATE REQUEST STATUS (Accept / Reject)
    static async updateRequestStatus(req: Request, res: Response) {
        try {
            const requestId = Number(req.params.id);
            const { status } = req.body;

            if (status !== 'Accepted' && status !== 'Rejected') {
                res.status(400).json({ message: "Invalid status value! Must be Accepted or Rejected." });
                return;
            }

            const request = await BloodModel.findRequestById(requestId);
            if (!request) {
                res.status(404).json({ message: "Request not found" });
                return;
            }

            await BloodModel.updateRequestStatus(requestId, status);
            
            // Phase 2 Notification Hook (Future integration stubs)
            try {
                await NotificationService.sendSMSNotification(
                    request.requester_phone,
                    `Your blood request to donor ID ${request.donor_id} has been ${status.toLowerCase()}.`
                );
            } catch (err) {
                console.error("Notification trigger failed:", err);
            }

            res.status(200).json({ message: `Request status updated to ${status}` });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ message: "Failed to update request status", error: error.message });
        }
    }
}