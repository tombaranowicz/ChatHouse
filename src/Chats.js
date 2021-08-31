import * as React from 'react';
import {
  View,
  Text,
  Button,
  Modal,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import {useState, useEffect} from 'react';
import {StreamChat} from 'stream-chat';
import {
  ChannelList,
  Chat,
  OverlayProvider,
  useChannelsContext,
} from 'stream-chat-react-native';

const filters = {};
const options = {limit: 20, messages_limit: 30};

const makeid = length => {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const CustomPreviewTitle = ({channel}) => (
  <Text>
    {channel.data.name} - {channel.data.description}
  </Text>
);

const chatClient = StreamChat.getInstance('STREAM_APP_ID');

const ChatsScreen = ({navigation, route}) => {
  const {email, userId, userName, token} = route.params;

  const [channelsKey, setChannelsKey] = useState(1);

  // DATA FOR MODAL
  const [modalVisible, setModalVisible] = useState(false);
  const [chatRoomName, setChatRoomName] = useState('');
  const [chatRoomDescription, setChatRoomDescription] = useState('');

  // HEADER
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        modalVisible ? null : (
          <Button
            onPress={() => setModalVisible(!modalVisible)}
            title="Create"
          />
        ),
      headerLeft: () => null,
    });
  }, [navigation, modalVisible]);

  // INIT STREAM - ONCE
  useEffect(() => {
    const connectStreamUser = async () => {
      try {
        await chatClient.connectUser(
          {
            id: userId,
            name: userName,
          },
          token,
        );
        console.log('logged in');
        setChannelsKey(channelsKey + 1);
      } catch (err) {
        console.log('----------ERROR-----------');
        console.log(err);
      }
    };

    if (!chatClient.userID) {
      connectStreamUser();
    }
  }, []);

  async function createChatRoom() {
    const channel = chatClient.channel('messaging', makeid(9), {
      name: chatRoomName,
      description: chatRoomDescription,
    });

    try {
      await channel.create();
    } catch (err) {
      console.log(err);
    }

    setModalVisible(!modalVisible);
    setChatRoomName('');
    setChatRoomDescription('');

    setChannelsKey(channelsKey + 1);
  }

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <OverlayProvider>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Create Chat Room</Text>
            <TextInput
              style={styles.input}
              onChangeText={setChatRoomName}
              value={chatRoomName}
              placeholder="Chat Room Name"
            />
            <TextInput
              style={styles.inputMultiline}
              onChangeText={setChatRoomDescription}
              value={chatRoomDescription}
              multiline
              numberOfLines={4}
              maxLength={100}
              placeholder="Short Description"
            />
            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.buttonCancel]}
                onPress={handleCancel}>
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  createChatRoom();
                }}>
                <Text style={styles.textStyle}>Create Room</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Chat client={chatClient}>
        <ChannelList
          key={channelsKey}
          PreviewTitle={CustomPreviewTitle}
          filters={filters}
          options={options}
          onSelect={channel => {
            navigation.navigate('ChatRoom', {
              channel: channel,
              chatClient: chatClient,
              name: channel.data.name,
            });
          }}
        />
      </Chat>
    </OverlayProvider>
  );
};

const styles = StyleSheet.create({
  input: {
    width: 200,
    height: 40,
    margin: 12,
    borderWidth: 0.2,
    padding: 5,
  },
  inputMultiline: {
    padding: 5,
    width: 200,
    height: 80,
    margin: 12,
    borderWidth: 0.2,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 4,
    padding: 10,
    elevation: 2,
  },
  buttonCancel: {
    backgroundColor: '#888888',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: 200,
  },
});

export default ChatsScreen;
