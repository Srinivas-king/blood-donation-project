import { Router } from 'express';
import { BloodController } from '../controller/blood.controller';

const router = Router();

// Route: http://localhost:3000/api/register
router.post('/register', BloodController.register);

// Route: http://localhost:3000/api/donors
router.get('/donors', BloodController.getAll);

router.post('/contact', BloodController.contact);

// Add this somewhere near other POST routes
router.post('/admin-login', BloodController.adminLogin);

router.delete('/donors/:id', BloodController.deleteDonor);

// ✅ donor login route
router.post('/login', BloodController.login);

// ✅ donor update route
router.put('/donors/:id', BloodController.updateDonor);

// ✅ blood requests routes
router.post('/blood-requests', BloodController.createBloodRequest);
router.get('/donors/:id/requests', BloodController.getDonorRequests);
router.get('/requester-requests', BloodController.getRequesterRequests);
router.put('/blood-requests/:id/status', BloodController.updateRequestStatus);

export default router;