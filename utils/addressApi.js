// utils/api.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';

/**
 * Fetch user's saved addresses from the server and enrich them with full addresses
 */
export const fetchUserAddresses = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('Token not found');

    const response = await fetch(
      'https://buildio.co.nz/api/users/my_addresses',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const result = await response.json();

    if (response.ok && result?.data) {
      const enrichedAddresses = await Promise.all(
        result.data.map(async addr => {
          try {
            const locRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${addr.lat}&lon=${addr.long}`,
            );
            const locData = await locRes.json();
            return {...addr, fullAddress: locData.display_name || ''};
          } catch (e) {
            return {...addr, fullAddress: ''};
          }
        }),
      );

      // Store address IDs in localStorage (if needed)
      const ids = result.data.map(addr => addr.id);
      await AsyncStorage.setItem('addressIds', JSON.stringify(ids));

      return {success: true, data: enrichedAddresses};
    } else {
      return {success: false, error: result?.message || 'Failed to fetch addresses'};
    }
  } catch (err) {
    console.error('Address fetch error:', err);
    return {success: false, error: 'Something went wrong while fetching addresses'};
  }
};
