import { onValue, ref, get } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { List } from '../../components';
import { db } from '../../config';
import { colors, fonts, getData } from '../../utils';

const Messages = ({ navigation }) => {
  const [doctor, setDoctor] = useState({});
  const [historyChat, setHistoryChat] = useState([]);

  useEffect(() => {
    getDoctorData();
  }, []);

  useEffect(() => {
    if (!doctor?.uid) return;

    const urlHistory = `messages/${doctor.uid}/`;
    const messagesDB = ref(db, urlHistory);

    onValue(messagesDB, async snapshot => {
      if (snapshot.exists()) {
        const oldData = snapshot.val();
        const data = [];

        const promises = Object.keys(oldData).map(async key => {
          const uidPartner = oldData[key].uidPartner;
          const userRef = ref(db, `users/${uidPartner}`);

          try {
            const userSnap = await get(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.val();
              data.push({
                id: key,
                dataUser: { ...userData, uid: uidPartner },
                ...oldData[key],
              });
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        });

        await Promise.all(promises);
        setHistoryChat(data);
      } else {
        setHistoryChat([]);
      }
    });
  }, [doctor?.uid]);

  const getDoctorData = async () => {
    const res = await getData('user');
    if (res) {
      setDoctor(res);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Messages</Text>
      {historyChat.length > 0 ? (
        historyChat.map(chat => {
          return (
            <List
              key={chat.id}
              profile={{ uri: chat.dataUser.photo }}
              name={chat.dataUser.fullName}
              desc={chat.lastContentChat || 'No message'}
              onPress={() =>
                navigation.navigate('Chatting', {
                  id: chat.dataUser.uid,
                  data: chat.dataUser,
                })
              }
            />
          );
        })
      ) : (
        <Text style={styles.emptyMessage}>No messages yet</Text>
      )}
    </View>
  );
};

export default Messages;

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.primary.bold,
    color: colors.text.primary,
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: fonts.primary.normal,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 50,
  },
});
