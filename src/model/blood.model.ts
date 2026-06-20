import { pool } from '../db/db';
import { ResultSetHeader } from 'mysql2';

// Interface
export interface Donor {
    id?: number;
    student_id: string;
    name: string;
    mobile_number: string;
    blood_group: string;
    branch: string;
    age: number;
    gender: string;
    college_name: string;
    last_donation_date: string;
    address?: string;
    password?: string;
}

export interface BloodRequest {
    id?: number;
    donor_id: number;
    requester_name: string;
    requester_phone: string;
    hospital_name: string;
    blood_group: string;
    location: string;
    message: string;
    status?: 'Pending' | 'Accepted' | 'Rejected';
    created_at?: string;
    updated_at?: string;
}

export class BloodModel {

    // SAVE NEW DONOR
    static async create(donor: Donor) {

        // 🔥 FIX: Date empty ga unte, NULL pampali. Ledante MySQL error istundi.
        const validDate = donor.last_donation_date && donor.last_donation_date.trim() !== "" ? donor.last_donation_date : null;

        const sql = `
            INSERT INTO donors 
            (student_id, name, mobile_number, blood_group, branch, age, gender, college_name, last_donation_date, address, password) 
            VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute<ResultSetHeader>(sql, [
            donor.student_id,
            donor.name,
            donor.mobile_number,
            donor.blood_group,
            donor.branch || '',
            isNaN(Number(donor.age)) ? 0 : Number(donor.age),
            donor.gender || '',
            donor.college_name,
            validDate,
            donor.address || '',
            donor.password || '1234'
        ]);
        return result;
    }

    // READ ALL
    static async findAll() {
        const sql = "SELECT * FROM donors ORDER BY id DESC";
        const [rows] = await pool.execute(sql);
        return rows;
    }

    // DELETE
    static async deleteById(id: number) {
        const sql = "DELETE FROM donors WHERE id = ?";
        const [result] = await pool.execute<ResultSetHeader>(sql, [id]);
        return result;
    }

    // CONTACT US
    static async saveContactMessage(data: any) {
        const sql = `INSERT INTO contact_us (full_name, email, subject, message) VALUES (?, ?, ?, ?)`;
        const values = [data.full_name, data.email, data.subject, data.message];
        const [result] = await pool.execute(sql, values);
        return result;
    }

    // UPDATE
    static async update(id: number, donor: Donor) {
        const validDate = donor.last_donation_date && donor.last_donation_date.trim() !== "" ? donor.last_donation_date : null;
        const sql = `
            UPDATE donors SET 
            name=?, mobile_number=?, blood_group=?, branch=?, age=?, college_name=?, last_donation_date=?
            WHERE id=?
        `;
        const [result] = await pool.execute<ResultSetHeader>(sql, [
            donor.name, donor.mobile_number, donor.blood_group, donor.branch,
            Number(donor.age), donor.college_name, validDate, id
        ]);
        return result;
    }

    // 1. Create a Blood Request
    static async createRequest(reqData: BloodRequest) {
        const sql = `
            INSERT INTO blood_requests 
            (donor_id, requester_name, requester_phone, hospital_name, blood_group, location, message) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute<ResultSetHeader>(sql, [
            reqData.donor_id,
            reqData.requester_name,
            reqData.requester_phone,
            reqData.hospital_name,
            reqData.blood_group,
            reqData.location,
            reqData.message
        ]);
        return result;
    }

    // 2. Find Requests directed to a Donor
    static async findRequestsByDonorId(donorId: number) {
        const sql = `
            SELECT * FROM blood_requests 
            WHERE donor_id = ? 
            ORDER BY id DESC
        `;
        const [rows] = await pool.execute(sql, [donorId]);
        return rows;
    }

    // 3. Find Requests made by a Requester (secured)
    // ONLY returns donor's mobile number if status is 'Accepted'
    static async findRequestsByRequesterPhone(phone: string) {
        const sql = `
            SELECT br.*, IF(br.status = 'Accepted', d.mobile_number, NULL) AS donor_mobile, d.name AS donor_name
            FROM blood_requests br
            JOIN donors d ON br.donor_id = d.id
            WHERE br.requester_phone = ?
            ORDER BY br.id DESC
        `;
        const [rows] = await pool.execute(sql, [phone]);
        return rows;
    }

    // 4. Update Request Status
    static async updateRequestStatus(requestId: number, status: 'Accepted' | 'Rejected') {
        const sql = `
            UPDATE blood_requests 
            SET status = ? 
            WHERE id = ?
        `;
        const [result] = await pool.execute<ResultSetHeader>(sql, [status, requestId]);
        return result;
    }

    // 5. Get a specific Request by ID
    static async findRequestById(requestId: number) {
        const sql = `
            SELECT * FROM blood_requests 
            WHERE id = ?
        `;
        const [rows]: any = await pool.execute(sql, [requestId]);
        return rows.length > 0 ? rows[0] : null;
    }
}