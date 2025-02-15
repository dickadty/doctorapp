import {onValue, push, ref, set} from 'firebase/database';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {ChatItem, Header, InputChat} from '../../components';
import {db} from '../../config';
import {colors, fonts, getChatTime, getData, setDateChat} from '../../utils';

const Chatting = ({navigation, route}) => {
  const dataDoctor = route.params;
  const [chatContent, setChatContent] = useState('');
  const [user, setUser] = useState({});
  const [chatData, setChatData] = useState([]);

  useEffect(() => {
    getDoctorData();
  }, []);

  useEffect(() => {
    if (!user.uid || !dataDoctor.id) return;

    const chatID =
      user.uid < dataDoctor.id
        ? `${user.uid}_${dataDoctor.id}`
        : `${dataDoctor.id}_${user.uid}`;

    const chatRef = ref(db, `chatting/${chatID}/allChat/`);

    onValue(chatRef, snapshot => {
      if (snapshot.exists()) {
        const dataSnapshot = snapshot.val();
        const allDataChat = [];

        Object.keys(dataSnapshot).map(key => {
          const dataChat = dataSnapshot[key];
          const newDataChat = [];

          Object.keys(dataChat).map(itemChat => {
            newDataChat.push({
              id: itemChat,
              data: dataChat[itemChat],
            });
          });

          allDataChat.push({
            id: key,
            data: newDataChat,
          });
        });

        setChatData(allDataChat);
      }
    });
  }, [dataDoctor.id, user.uid]);

  const getDoctorData = async () => {
    const res = await getData('user');
    if (res) {
      setUser(res);
    }
  };

  const sendChat = () => {
    const day = new Date();
    const chatID =
      user.uid < dataDoctor.id
        ? `${user.uid}_${dataDoctor.id}`
        : `${dataDoctor.id}_${user.uid}`;

    const data = {
      sendBy: user.uid,
      chatContent: chatContent,
      chatDate: day.getTime(),
      chatTime: getChatTime(day),
    };

    const chatRef = ref(db, `chatting/${chatID}/allChat/${setDateChat(day)}`);
    const messageUserRef = ref(db, `messages/${user.uid}/${chatID}`);
    const messageDoctorRef = ref(db, `messages/${dataDoctor.id}/${chatID}`);

    const dataHistoryChat = {
      lastContentChat: chatContent,
      lastChatDate: day.getTime(),
      uidPartner: dataDoctor.id,
    };

    push(chatRef, data)
      .then(() => {
        setChatContent('');

        set(messageUserRef, dataHistoryChat).catch(error =>
          console.error('Error updating user history:', error),
        );

        set(messageDoctorRef, dataHistoryChat).catch(error =>
          console.error('Error updating doctor history:', error),
        );
      })
      .catch(error => console.error('Error sending chat:', error));
  };

  return (
    <View style={styles.page}>
      <Header
        type="dark-profile"
        title={dataDoctor.data.fullName}
        desc={dataDoctor.data.profession}
        photo={{uri: dataDoctor.data.photo}}
        onPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {chatData.map(chat => (
            <View key={chat.id}>
              <Text style={styles.chatDate}>{chat.id}</Text>
              {chat.data.map(itemChat => (
                <ChatItem
                  key={itemChat.id}
                  isMe={itemChat.data.sendBy === user.uid}
                  text={itemChat.data.chatContent}
                  date={itemChat.data.chatTime}
                  photo={
                    itemChat.data.sendBy !== user.uid
                      ? {uri: dataDoctor.data.photo}
                      : null
                  }
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
      <InputChat
        value={chatContent}
        onChangeText={setChatContent}
        onButtonPress={sendChat}
        targetChat={dataDoctor.data}
      />
    </View>
  );
};

export default Chatting;

const styles = StyleSheet.create({
  page: {backgroundColor: colors.white, flex: 1},
  content: {flex: 1},
  chatDate: {
    fontSize: 11,
    fontFamily: fonts.primary.normal,
    color: colors.text.secondary,
    marginVertical: 20,
    textAlign: 'center',
  },
});
