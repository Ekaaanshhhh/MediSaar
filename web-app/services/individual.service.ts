import mongoose from "mongoose";
import { IndividualProfile } from "../models/IndividualProfile";
import { InstitutionProfile } from "../models/InstitutionProfile";
import { DoctorProfile } from "../models/DoctorProfile";
import { User } from "../models/User";
import { Visit } from "../models/Visit";
import { Diagnosis } from "../models/Diagnosis";
import { Prescription } from "../models/Prescription";
import { Report } from "../models/Report";
import { AISummary } from "../models/AISummary";
import { PatientAssociation } from "../models/PatientAssociation";
import { ApiError } from "../lib/apiError";

export class IndividualService {
  /**
   * Helper to fetch the patient profile. Ensures ownership.
   */
  private static async getPatientProfile(userId: string) {
    const profile = await IndividualProfile.findOne({ userId }).lean();
    if (!profile) {
      throw new ApiError("Individual profile not found", 404);
    }
    return profile;
  }

  /**
   * Return all institutions where the patient has at least one Visit.
   */
  static async getInstitutions(userId: string) {
    const profile = await this.getPatientProfile(userId);

    const pipeline = [
      { 
        $match: { 
          patientId: profile._id
        } 
      },
      {
        $lookup: {
          from: "institutionprofiles",
          localField: "institutionId",
          foreignField: "_id",
          as: "institution"
        }
      },
      { $unwind: "$institution" },
      {
        $lookup: {
          from: "visits",
          let: { instId: "$institutionId", pId: "$patientId" },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $and: [
                    { $eq: ["$institutionId", "$$instId"] },
                    { $eq: ["$patientId", "$$pId"] },
                    { $ne: ["$isDeleted", true] }
                  ]
                }
              }
            },
            { $sort: { visitDate: -1 } }
          ],
          as: "visits"
        }
      },
      {
        $project: {
          _id: 0,
          institutionId: "$institution._id",
          institutionName: "$institution.institutionName",
          institutionType: "$institution.institutionType",
          totalVisits: { $size: "$visits" },
          lastVisitDate: { $arrayElemAt: ["$visits.visitDate", 0] }
        }
      },
      { $sort: { institutionName: 1 } }
    ];

    const institutions = await PatientAssociation.aggregate(pipeline as any);
    return institutions;
  }

  /**
   * Return complete medical history for a specific institution.
   */
  static async getInstitutionHistory(userId: string, institutionIdStr: string) {
    const profile = await this.getPatientProfile(userId);
    const patientId = profile._id;

    if (!mongoose.Types.ObjectId.isValid(institutionIdStr)) {
      throw new ApiError("Invalid institution ID format", 400);
    }
    const institutionId = new mongoose.Types.ObjectId(institutionIdStr);

    // 1. Verify institution exists in our records
    const institution = await InstitutionProfile.findById(institutionId).lean();
    if (!institution) {
      throw new ApiError("Institution not found", 404);
    }

    // 2. Fetch all raw visits (excluding soft deleted)
    const visits = await Visit.find({
      patientId,
      institutionId,
      isDeleted: { $ne: true }
    }).sort({ visitDate: 1 }).lean(); // Sort chronological

    if (visits.length === 0) {
      throw new ApiError("No history found for this institution", 404);
    }

    const visitIds = visits.map(v => v._id);

    // 3. Fetch related records
    const [diagnoses, prescriptions, reports, aiSummaries] = await Promise.all([
      Diagnosis.find({ visitId: { $in: visitIds }, isDeleted: { $ne: true } }).lean(),
      Prescription.find({ visitId: { $in: visitIds }, isDeleted: { $ne: true } }).lean(),
      Report.find({ visitId: { $in: visitIds }, isDeleted: { $ne: true } }).lean(),
      AISummary.find({ visitId: { $in: visitIds } }).lean() // No isDeleted on AISummary schema typically
    ]);

    // Gather doctor details
    // We can collect all unique doctorIds from visits, diagnoses, prescriptions
    const doctorIds = new Set<string>();
    visits.forEach(v => { if (v.doctorId) doctorIds.add(v.doctorId.toString()); });
    diagnoses.forEach(d => { if (d.doctorId) doctorIds.add(d.doctorId.toString()); });
    prescriptions.forEach(p => { if (p.doctorId) doctorIds.add(p.doctorId.toString()); });

    const doctorsList = await DoctorProfile.find({ _id: { $in: Array.from(doctorIds) } }).lean();
    // Fetch associated User records for doctor names
    const doctorUserIds = doctorsList.map(d => d.userId);
    const doctorUsers = await User.find({ _id: { $in: doctorUserIds } }).lean();

    const doctorMap = new Map();
    doctorsList.forEach(doc => {
      const u = doctorUsers.find(u => u._id.toString() === doc.userId.toString());
      doctorMap.set(doc._id.toString(), {
        id: doc._id.toString(),
        name: u ? u.name : "Unknown Doctor",
        specialization: doc.specialization
      });
    });

    // 4. Construct Structured Visits and Timeline Events
    const timelineEvents: any[] = [];
    const structuredVisits = visits.map(visit => {
      const vIdStr = visit._id.toString();
      
      const vDiagnoses = diagnoses.filter(d => d.visitId.toString() === vIdStr);
      const vPrescriptions = prescriptions.filter(p => p.visitId.toString() === vIdStr);
      const vReports = reports.filter(r => r.visitId.toString() === vIdStr);
      const vAISummaries = aiSummaries.filter(a => a.visitId.toString() === vIdStr);

      // Add to Timeline (Visit)
      timelineEvents.push({
        eventType: "VISIT",
        date: visit.visitDate,
        title: visit.chiefComplaint || "Institution Visit",
        visitId: vIdStr
      });

      // Add to Timeline (Diagnoses)
      vDiagnoses.forEach(d => {
        timelineEvents.push({
          eventType: "DIAGNOSIS",
          date: d.createdAt || visit.visitDate,
          title: d.conditionName,
          visitId: vIdStr
        });
      });

      // Add to Timeline (Prescriptions)
      vPrescriptions.forEach(p => {
        timelineEvents.push({
          eventType: "PRESCRIPTION",
          date: p.createdAt || visit.visitDate,
          title: `Prescription (${p.medicines?.length || 0} medicines)`,
          visitId: vIdStr
        });
      });

      // Add to Timeline (Reports)
      vReports.forEach(r => {
        timelineEvents.push({
          eventType: "REPORT",
          date: r.reportDate || r.createdAt || visit.visitDate,
          title: r.title,
          visitId: vIdStr
        });
      });

      return {
        visitId: vIdStr,
        visitDate: visit.visitDate,
        chiefComplaint: visit.chiefComplaint,
        status: visit.status,
        doctor: visit.doctorId ? doctorMap.get(visit.doctorId.toString()) : null,
        diagnoses: vDiagnoses,
        prescriptions: vPrescriptions,
        reports: vReports,
        aiSummaries: vAISummaries
      };
    });

    // Sort timeline chronologically (ascending)
    timelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 5. Generate Summary
    const summary = {
      totalVisits: visits.length,
      totalDiagnoses: diagnoses.length,
      totalReports: reports.length,
      totalPrescriptions: prescriptions.length,
      firstVisit: visits[0].visitDate,
      lastVisit: visits[visits.length - 1].visitDate
    };

    return {
      institution: {
        id: institution._id.toString(),
        name: institution.institutionName,
        type: institution.institutionType
      },
      summary,
      timelineEvents,
      visits: structuredVisits
    };
  }

  /**
   * Return all medical reports for the authenticated patient, aggregating across all institutions.
   */
  static async getReports(userId: string, searchQuery?: string) {
    const profile = await this.getPatientProfile(userId);
    const patientId = profile._id;

    // 1. Find all reports for the patient
    const query: any = { patientId, isDeleted: { $ne: true } };
    
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { reportType: { $regex: searchQuery, $options: 'i' } },
        { extractedText: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    let reports = await Report.find(query).sort({ reportDate: -1, createdAt: -1 }).lean();
    
    if (reports.length === 0) {
      return {
        summary: { totalReports: 0 },
        reports: []
      };
    }

    // 2. Resolve Visits -> Institutions
    const visitIds = reports.map(r => r.visitId);
    const visits = await Visit.find({ _id: { $in: visitIds } }).lean();
    
    const institutionIds = visits.map(v => v.institutionId);
    const institutions = await InstitutionProfile.find({ _id: { $in: institutionIds } }).lean();

    const uploaderUserIds = reports.map(r => r.uploadedBy);
    const uploaderInstitutions = await InstitutionProfile.find({ userId: { $in: uploaderUserIds } }).lean();
    
    const uploaderInstMap = new Map();
    uploaderInstitutions.forEach(i => uploaderInstMap.set(i.userId.toString(), i));

    const visitMap = new Map();
    visits.forEach(v => visitMap.set(v._id.toString(), v));

    const instMap = new Map();
    institutions.forEach(i => instMap.set(i._id.toString(), i));

    // 3. Format and optionally filter by institutionName if searchQuery exists
    let formattedReports = reports.map(r => {
      const visit = visitMap.get(r.visitId?.toString());
      const inst = visit ? instMap.get(visit.institutionId?.toString()) : null;
      const uploadedByInst = uploaderInstMap.get(r.uploadedBy?.toString());
      
      return {
        reportId: r._id.toString(),
        title: r.title,
        reportType: r.reportType,
        institution: inst ? {
          id: inst._id.toString(),
          name: inst.institutionName,
          type: inst.institutionType
        } : null,
        uploadedByInstitution: uploadedByInst ? {
          id: uploadedByInst._id.toString(),
          name: uploadedByInst.institutionName
        } : null,
        visitId: r.visitId?.toString() || null,
        reportDate: r.reportDate || r.createdAt,
        extractedText: r.extractedText || null,
        thumbnailUrl: r.cloudinaryUrl || "https://placehold.co/400x300/e2e8f0/475569?text=Report+Preview",
        viewUrl: r.cloudinaryUrl || "https://placehold.co/800x1200/e2e8f0/475569?text=Full+Report+Document"
      };
    });

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      formattedReports = formattedReports.filter(r => 
        (r.title && r.title.toLowerCase().includes(lowerQ)) ||
        (r.reportType && r.reportType.toLowerCase().includes(lowerQ)) ||
        (r.extractedText && r.extractedText.toLowerCase().includes(lowerQ)) ||
        (r.institution && r.institution.name.toLowerCase().includes(lowerQ))
      );
    }

    // 4. Calculate Summary Statistics
    const summary: any = {
      totalReports: formattedReports.length,
    };
    
    formattedReports.forEach(r => {
      let key = r.reportType.toLowerCase();
      if (key === 'blood_report') key = 'bloodReports';
      else if (key === 'xray') key = 'xrayReports';
      else if (key === 'mri') key = 'mriReports';
      else if (key === 'ct_scan') key = 'ctScanReports';
      else if (key === 'lab_report') key = 'labReports';
      else if (key === 'prescription_scan') key = 'prescriptionScans';
      else if (key === 'discharge_summary') key = 'dischargeSummaries';
      else if (key === 'invoice') key = 'invoices';
      else key = key.replace(/_/g, '') + 's';
      
      if (!summary[key]) summary[key] = 0;
      summary[key]++;
    });

    return {
      summary,
      reports: formattedReports
    };
  }

  /**
   * Return aggregated data for the Individual Dashboard.
   */
  static async getDashboardData(userId: string) {
    const profile = await this.getPatientProfile(userId);
    const patientId = profile._id;

    // 1. Fetch raw data
    const [visits, reports, prescriptions, diagnoses] = await Promise.all([
      Visit.find({ patientId, isDeleted: { $ne: true } }).sort({ visitDate: -1 }).lean(),
      Report.find({ patientId, isDeleted: { $ne: true } }).sort({ reportDate: -1, createdAt: -1 }).lean(),
      Prescription.find({ patientId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean(),
      Diagnosis.find({ patientId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean()
    ]);

    const visitIds = visits.map(v => v._id);

    // 2. Fetch Institutions logic
    const institutionIds = Array.from(new Set(visits.map(v => v.institutionId?.toString()).filter(Boolean)));
    const institutions = await InstitutionProfile.find({ _id: { $in: institutionIds } }).lean();
    
    const instMap = new Map();
    institutions.forEach(i => instMap.set(i._id.toString(), i));

    const recentInstitutions: any[] = [];
    const seenInstIds = new Set();
    // Visits are sorted descending, so the first time we see an inst ID, it's the most recent visit
    for (const v of visits) {
      if (v.institutionId) {
        const idStr = v.institutionId.toString();
        if (!seenInstIds.has(idStr)) {
          seenInstIds.add(idStr);
          const inst = instMap.get(idStr);
          if (inst) {
            recentInstitutions.push({
              institutionId: idStr,
              institutionName: inst.institutionName,
              lastVisitDate: v.visitDate
            });
          }
        }
      }
    }

    // 3. Summary Aggregations
    const summary = {
      totalVisits: visits.length,
      totalReports: reports.length,
      totalPrescriptions: prescriptions.length,
      totalInstitutions: institutionIds.length
    };

    // 4. Timeline Events (Visits, Reports, Diagnoses)
    let timelineEvents: any[] = [];
    visits.forEach(v => timelineEvents.push({
      id: v._id.toString(),
      type: 'VISIT',
      date: v.visitDate,
      title: v.status === 'COMPLETED' ? 'Completed Visit' : (v.chiefComplaint || 'Institution Visit'),
      description: v.status === 'COMPLETED' ? 'Routine visit completed' : 'Visit scheduled/in progress',
      institutionId: v.institutionId?.toString()
    }));
    reports.forEach(r => timelineEvents.push({
      id: r._id.toString(),
      type: 'REPORT',
      date: r.reportDate || r.createdAt,
      title: r.title,
      description: `Report Type: ${(r.reportType || '').replace(/_/g, ' ')}`,
      institutionId: null
    }));
    diagnoses.forEach(d => timelineEvents.push({
      id: d._id.toString(),
      type: 'DIAGNOSIS',
      date: d.createdAt,
      title: d.conditionName,
      description: `New diagnosis added`,
      institutionId: null
    }));

    // Sort timeline DESC and slice to 5
    timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    timelineEvents = timelineEvents.slice(0, 5);

    // 5. Recent Reports
    const recentReports = reports.slice(0, 3).map(r => ({
      reportId: r._id.toString(),
      title: r.title,
      reportType: r.reportType,
      reportDate: r.reportDate || r.createdAt,
      thumbnailUrl: r.cloudinaryUrl || "https://placehold.co/400x300/e2e8f0/475569?text=Report+Preview"
    }));

    // 6. Upcoming Follow Ups
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingFollowUps = visits
      .filter(v => v.status === 'FOLLOW_UP_REQUIRED' && new Date(v.visitDate) > today)
      .map(v => ({
        visitId: v._id.toString(),
        date: v.visitDate,
        chiefComplaint: v.chiefComplaint,
        institutionName: instMap.get(v.institutionId?.toString())?.institutionName || 'Unknown'
      }));

    // 7. Health Snapshot (Profile Info, Deduplicated Medications, Conditions)
    const activeConditions = Array.from(new Set(diagnoses.map(d => d.conditionName)));
    
    // Deduplicate active medications
    const medicationMap = new Map();
    prescriptions.forEach(p => {
      if (p.medicines && Array.isArray(p.medicines)) {
        p.medicines.forEach((med: any) => {
          if (!med.medicineName) return;
          const nameLower = med.medicineName.toLowerCase().trim();
          if (!medicationMap.has(nameLower)) {
            medicationMap.set(nameLower, {
              name: med.medicineName,
              dosage: med.dosage,
              frequency: med.frequency
            });
          }
        });
      }
    });
    const activeMedications = Array.from(medicationMap.values());

    const healthSnapshot = {
      bloodGroup: profile.bloodGroup || 'Unknown',
      allergies: profile.allergies || [],
      currentConditions: activeConditions,
      activeMedications,
      latestVisitDate: visits.length > 0 ? visits[0].visitDate : null
    };

    // 8. AI Summary Fallback
    const aiSummary = profile.currentAISummary || null;

    // 9. Last Updated
    const lastUpdated = new Date().toISOString();

    return {
      summary,
      profile: {
        id: profile._id.toString(),
        mediSaarId: profile.mediSaarId,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender
      },
      healthSnapshot,
      aiSummary,
      timelineEvents,
      recentReports,
      recentInstitutions,
      upcomingFollowUps,
      lastUpdated
    };
  }
}
