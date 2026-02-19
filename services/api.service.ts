// // services/api.service.ts
// import { ENDPOINTS } from '@/config/endpoints';

// export const submitFormData = async (
//   formType: string,
//   data: any,
//   centreType?: string
// ): Promise<any> => {
//   let endpoint = '';
//   let payload = { ...data };
  
//   // Map form type to API endpoint
//   switch (formType) {
//     case 'NGO':
//       endpoint = ENDPOINTS.NGO?.ADD || '/api/ngo/add';
//       // Transform data if needed
//       payload = transformNGOPayload(data);
//       break;
    
//     case 'Hospital':
//       endpoint = ENDPOINTS.HOSPITAL?.ADD || '/api/hospital/add';
//       payload = transformHospitalPayload(data);
//       break;
    
//     case 'old_age_homes':
//       endpoint = ENDPOINTS.OLD_AGE_HOME?.ADD || '/api/old-age-home/add';
//       payload = transformOldAgeHomePayload(data);
//       break;
    
//     default:
//       // Check if centreType is provided
//       if (centreType) {
//         endpoint = `/api/${centreType}/add`;
//       } else {
//         throw new Error(`Unknown form type: ${formType}`);
//       }
//   }
  
//   try {
//     const response = await fetch(endpoint, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         // Add auth token if needed
//         'Authorization': `Bearer ${await getAuthToken()}`,
//       },
//       body: JSON.stringify(payload),
//     });
    
//     if (!response.ok) {
//       throw new Error(`API Error: ${response.status}`);
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Submit error:', error);
//     throw error;
//   }
// };

// // Helper functions to transform payloads
// const transformNGOPayload = (data: any) => {
//   return {
//     ...data,
//     // Add any additional transformations for NGO
//     createdDate: new Date().toISOString(),
//     status: 'pending', // or 'active'
//   };
// };

// const transformHospitalPayload = (data: any) => {
//   return {
//     ...data,
//     // Add any additional transformations for Hospital
//     type: 'hospital',
//     createdDate: new Date().toISOString(),
//   };
// };

// const transformOldAgeHomePayload = (data: any) => {
//   return {
//     ...data,
//     // Add any additional transformations for Old Age Home
//     type: 'old_age_home',
//     createdDate: new Date().toISOString(),
//   };
// };

// // Helper to get auth token
// const getAuthToken = async (): Promise<string> => {
//   // Implement your token retrieval logic
//   return localStorage.getItem('authToken') || '';
// };