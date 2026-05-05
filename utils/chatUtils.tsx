// utils/chatUtils.ts
import firestore from '@react-native-firebase/firestore';

/**
 * Generates a consistent chat ID from two user IDs
 */
export const generateChatId = (userId1: string, userId2: string): string => {
  if (!userId1 || !userId2) {
    throw new Error('Both user IDs are required');
  }
  if (userId1 === userId2) {
    throw new Error('Cannot create chat with same user');
  }
  return [userId1, userId2].sort().join('_');
};

/**
 * Mark all unread messages as read for a specific user in a chat
 */
export const markMessagesAsRead = async (
  currentUserId: string,
  otherUserId: string
): Promise<void> => {
  if (!currentUserId || !otherUserId) return;

  const chatDocId = [currentUserId, otherUserId].sort().join('_');
  const chatRef = firestore().collection('chats').doc(chatDocId);

  try {
    const batch = firestore().batch();

    // 🔥 fetch chat doc to know schema
    const chatSnap = await chatRef.get();
    const chatData = chatSnap.data();

    if (!chatData) return;

    if (Array.isArray(chatData.unreadCount)) {
      // ✅ array schema → map index from members
      const members = chatData.members || [];
      const unreadCount = [...chatData.unreadCount];
      const idx = members.indexOf(currentUserId);

      if (idx !== -1) {
        unreadCount[idx] = 0;
        batch.update(chatRef, { unreadCount });
      }
    } else {
      // ✅ map schema → just update the key
      batch.update(chatRef, {
        [`unreadCount.${currentUserId}`]: 0
      });
    }
    await chatRef.update({ [`unreadCounts.${currentUserId}`]: 0 });


    // ✅ mark messages read
    const unreadMessagesSnap = await chatRef
      .collection('messages')
      .where('readBy', 'not-in', [currentUserId])
      .get();

    unreadMessagesSnap.docs.forEach((doc) => {
      batch.update(doc.ref, {
        readBy: firestore.FieldValue.arrayUnion(currentUserId),
      });
    });

    await batch.commit();

    console.log(
      `✅ Marked ${unreadMessagesSnap.docs.length} messages as read in chat ${chatDocId}`
    );
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};
/**
 * Get unread message count for a user in a chat
 */
// export const markMessagesAsRead = async (
//   currentUserId: string,
//   otherUserId: string
// ): Promise<void> => {
//   if (!currentUserId || !otherUserId) return;

//   const chatDocId = [currentUserId, otherUserId].sort().join('_'); // ✅ generate chatId inline
//   const chatRef = firestore().collection('chats').doc(chatDocId);

//   try {
//     const batch = firestore().batch();

//     // ✅ Reset unread count for this user in the chat doc
//     batch.update(chatRef, {
//       [`unreadCount.${currentUserId}`]: 0,
//     });

//     // ✅ Get messages not yet read by this user
//     const unreadMessagesSnap = await chatRef
//       .collection('messages')
//       .where('readBy', 'not-in', [currentUserId])
//       .get();

//     if (!unreadMessagesSnap.empty) {
//       unreadMessagesSnap.docs.forEach((doc) => {
//         batch.update(doc.ref, {
//           readBy: firestore.FieldValue.arrayUnion(currentUserId),
//         });
//       });
//     }

//     await batch.commit();

//     console.log(
//       `✅ Marked ${unreadMessagesSnap.docs.length} messages as read in chat ${chatDocId}`
//     );
//   } catch (error) {
//     console.error('Error marking messages as read:', error);
//     throw error; // rethrow so UI can handle
//   }
// };
export const getUnreadCount = async (
  currentUserId: string,
  otherUserId: string
): Promise<number> => {
  const chatDocId = generateChatId(currentUserId, otherUserId);
  
  try {
    const chatDoc = await firestore()
      .collection('chats')
      .doc(chatDocId)
      .get();
    
    if (chatDoc.exists()) {
      const data = chatDoc.data();
      return data?.unreadCount?.[currentUserId] || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// export const markMessagesAsRead = async (
//   currentUserId: string,
//   otherUserId: string
// ): Promise<void> => {
//   const chatDocId = generateChatId(currentUserId, otherUserId);
//   console.log('hello');

//   try {
//     const batch = firestore().batch();
//     const chatRef = firestore().collection('chats').doc(chatDocId);

//     // Reset unread count for current user
//     batch.update(chatRef, {
//       [`unreadCount.${currentUserId}`]: 0,
//     });

//     // Get all unread messages sent to current user
//     const unreadMessages = await firestore()
//       .collection('chats')
//       .doc(chatDocId)
//       .collection('messages')
//       .where('unread', '==', true)
//       .where('sendTo', '==', currentUserId)
//       .get();

//     // Mark each message as read
//     unreadMessages.docs.forEach((doc) => {
//       batch.update(doc.ref, {
//         unread: false,
//         readBy: firestore.FieldValue.arrayUnion(currentUserId),
//       });
//     });

//     await batch.commit();

//     console.log(
//       `Marked ${unreadMessages.docs.length} messages as read`
//     );
//   } catch (error) {
//     console.error('Error marking messages as read:', error);
//     throw error; // Re-throw to allow handling in component
//   }
// };
/**
 * Update last message in chat document
 */
export const updateLastMessage = async (
  userId1: string,
  userId2: string,
  message: string,
  senderId: string
): Promise<void> => {
  const chatDocId = generateChatId(userId1, userId2);
  
  try {
    await firestore()
      .collection('chats')
      .doc(chatDocId)
      .update({
        lastMessage: message,
        lastMessageTime: firestore.FieldValue.serverTimestamp(),
        lastMessageSenderId: senderId,
      });
  } catch (error) {
    console.error('Error updating last message:', error);
    throw error;
  }
};

/**
 * Increment unread count for a user
 */
export const incrementUnreadCount = async (
  recipientUserId: string,
  senderUserId: string
): Promise<void> => {
  const chatDocId = generateChatId(recipientUserId, senderUserId);
  
  try {
    await firestore()
      .collection('chats')
      .doc(chatDocId)
      .update({
        [`unreadCount.${recipientUserId}`]: firestore.FieldValue.increment(1)
      });
  } catch (error) {
    console.error('Error incrementing unread count:', error);
    throw error;
  }
};