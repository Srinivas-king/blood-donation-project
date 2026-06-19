import { BloodModel, Donor } from '../model/blood.model';
import { db } from '../db/db'; 

export class BloodService {
    
    static async registerDonor(data: Donor) {
        return await BloodModel.create(data);
    }

    static async getAllDonors() {
        return await BloodModel.findAll();
    }

   // --- NEW CONTACT MESSAGE LOGIC ---
    static async saveContactMessage(data: any) {
        // Just call the Model, don't write SQL here
        return await BloodModel.saveContactMessage(data);
    }
}