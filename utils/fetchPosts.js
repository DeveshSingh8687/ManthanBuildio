import AsyncStorage from "@react-native-async-storage/async-storage";
const BASE_URL = 'https://buildio.co.nz/api';
export const fetchPosts = async (page = 1, limit = 10) => {
  const token = await AsyncStorage.getItem('authToken');
  console.log(token)
  try {
    const res = await fetch(`${BASE_URL}/posts/list?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    const data = await res.json();
    console.log(data)
    if (!res.ok) throw new Error(data.message || 'Failed to fetch posts');
    return data?.data?.data || [];
  } catch (err) {
    console.error('Fetch Posts Error:', err);
    return [];
  }
};
export const fetchMyPosts = async (page = 1, limit = 10) => {
  const token = await AsyncStorage.getItem('authToken');
  try {
    const res = await fetch(
      `${BASE_URL}/users/my_posts?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch posts');
    return data?.data?.data || [];
  } catch (err) {
    console.error('Fetch Posts Error:', err);
    return [];
  }
};
export const handleDeletePost = async (postId) => {
  const token = await AsyncStorage.getItem('authToken');

  try {
    const response = await fetch(`https://buildio.co.nz/api/posts/delete/${postId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete post.');
    }

    return data;
  } catch (error) {
    console.error('❌ Delete Post Error:', error.message);
    throw error;
  }
};
export const fetchFeed = async () => {
  try {
    const response = await fetch("https://buildio.co.nz/api/home/feed", {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch feed");
    }

    const data = await response.json();
    // console.log(data,'data')
    return data; // will return { status, message, data }
  } catch (error) {
    console.error("fetchFeed error:", error);
    throw error;
  }
};
export const fetchNewsWithoutAuth = async () => {
  try {
    const response = await fetch("https://buildio.co.nz/api/home/news", {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch feed");
    }

    const data = await response.json();
    console.log(data,'data')
    return data; // will return { status, message, data }
  } catch (error) {
    console.error("fetchFeed error:", error);
    throw error;
  }
};