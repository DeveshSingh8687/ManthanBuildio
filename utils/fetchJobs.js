import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// services/jobTypesService.js

const BASE_URL = 'https://buildio.co.nz/api';

export const fetchJobTypes = async () => {
  const token = await AsyncStorage.getItem('authToken');
   if(!token) {
    Alert('No auth token found');
  }

  try {
    const response = await fetch(
      'https://buildio.co.nz/api/common/job_types_list',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const result = await response.json();

    if (response.ok && result.status && result.data?.services) {
      return {success: true, data: result.data.services};
    } else {
      return {
        success: false,
        error: result.message || 'Failed to fetch job types',
      };
    }
  } catch (error) {
    console.error('Fetch Job Types Error:', error);
    return {success: false, error: 'Something went wrong'};
  }
};

export const fetchMyJobs = async () => {
  const token = await AsyncStorage.getItem('authToken');
   if(!token) {
    Alert('No auth token found');
  }
  console.log(token);
  try {
    const response = await fetch('https://buildio.co.nz/api/users/my_jobs', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await response.json();

    if (response.ok && json?.data) {
      return {success: true, data: json.data};
    } else {
      return {success: false, error: json?.message || 'Unknown error occurred'};
    }
  } catch (error) {
    return {success: false, error: 'Network error or server not responding'};
  }
};

// export const getAppliedJobs = async () => {
//   const token = await AsyncStorage.getItem('authToken');

//   try {
//     const response = await fetch(`${BASE_URL}/users/my_applied_jobs`, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching applied jobs:', error);
//     throw error;
//   }
// };
export const getAppliedJobs = async () => {
  const token = await AsyncStorage.getItem('authToken');
   if(!token) {
    Alert('No auth token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/users/my_applied_jobs`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await response.json();

    if (response.ok && json?.data) {
      return { success: true, data: json.data }; // ✅ same shape as fetchMyJobs
    } else {
      return { success: false, error: json?.message || 'Unknown error occurred' };
    }
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    return { success: false, error: 'Network error or server not responding' };
  }
};
export const getMyJobs = async (limit = 50) => {
  const token = await AsyncStorage.getItem('authToken');
  if(!token) {
    Alert('No auth token found');
  }
  try {
    // ✅ choose URL based on token
    const url = token
      ? `${BASE_URL}/jobs/list?page=1&limit=${limit}`
      : 'https://buildio.co.nz/api/home/jobs';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to fetch jobs');
    }

    const data = await response.json();
    return data; // expected: { status, message, data }
  } catch (error) {
    console.error('Fetch my_jobs error:', error.message);
    throw error;
  }
};

export const handleApply = async jobId => {
  const token = await AsyncStorage.getItem('authToken');

  try {
    const response = await fetch(`${BASE_URL}/jobs/apply/${jobId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to apply for the job.');
    }
    return data;
  } catch (error) {
    console.error('❌ Apply Error:', error.message);
    // Show error toast/message
  }
};

export const deleteJob = async jobId => {
  console.log('🛠 deleteJob called with:', jobId);
  const token = await AsyncStorage.getItem('authToken');
  console.log('🔑 Token retrieved:', token);

  try {
    const url = `${BASE_URL}/jobs/delete/${jobId}`;
    console.log('🌐 API URL:', url);

    const response = await fetch(url, {
      method: 'GET', // API requires GET
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('📡 Response status:', response.status);

    const data = await response.json();
    console.log('📦 Response JSON:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete job');
    }

    return {success: true, message: 'Job deleted successfully'};
  } catch (error) {
    console.error('❌ Delete Job Error:', error.message);
    return {success: false, message: error.message || 'Unknown error'};
  }
};

export const declineJobApplication = async applicationId => {
  const token = await AsyncStorage.getItem('authToken');

  try {
    const response = await fetch(`${BASE_URL}/jobs/decline/${applicationId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorText = await response.text(); // for debugging
      throw new Error(
        `Failed to decline job: ${response.status} - ${errorText}`,
      );
    }

    return await response.json(); // assuming backend returns JSON
  } catch (error) {
    console.error('Error in declineJobApplication:', error);
    throw error;
  }
};
export const acceptJobApplication = async applicationId => {
  try {
    const token = await AsyncStorage.getItem('authToken');

    const response = await fetch(`${BASE_URL}/jobs/accept/${applicationId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'multipart/form-data',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Failed to accept job');
    }

    return data;
  } catch (error) {
    console.error('Error accepting job:', error);
    throw error;
  }
};
export const fetchJobs = async () => {
  try {
    const response = await fetch('https://buildio.co.nz/api/home/jobs', {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    const data = await response.json();
    return data; // {status, message, data}
  } catch (error) {
    console.error('fetchJobs error:', error);
    throw error;
  }
};

// ✅ Pagination helper for getMyJobs
export const getMyJobsPaginated = async (page = 1, limit = 10) => {
  const token = await AsyncStorage.getItem('authToken');
  try {
    const url = token
      ? `${BASE_URL}/jobs/list?page=${page}&limit=${limit}`
      : 'https://buildio.co.nz/api/home/jobs';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to fetch jobs');
    }

    const data = await response.json();
    return data; // expected: { status, message, data, pagination }
  } catch (error) {
    console.error('Fetch paginated jobs error:', error.message);
    throw error;
  }
};

// ✅ Pagination helper for getAppliedJobs
export const getAppliedJobsPaginated = async (page = 1, limit = 10) => {
  const token = await AsyncStorage.getItem('authToken');

  try {
    const response = await fetch(
      `${BASE_URL}/users/my_applied_jobs?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const json = await response.json();

    if (response.ok && json?.data) {
      return { success: true, data: json.data, pagination: json.pagination };
    } else {
      return { success: false, error: json?.message || 'Unknown error occurred' };
    }
  } catch (error) {
    console.error('Error fetching paginated applied jobs:', error);
    return { success: false, error: 'Network error or server not responding' };
  }
};
