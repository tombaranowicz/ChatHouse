import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  OverlayProvider as ChatOverlayProvider,
} from 'stream-chat-react-native';
import {SafeAreaView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const ChatRoom = ({navigation, route}) => {
  const {channel, chatClient} = route.params;
  const {bottom} = useSafeAreaInsets();

  return (
    <SafeAreaView>
      <ChatOverlayProvider bottomInset={bottom} topInset={0}>
        <Chat client={chatClient}>
          <Channel channel={channel} keyboardVerticalOffset={0}>
            <View style={StyleSheet.absoluteFill}>
              <MessageList />
              <MessageInput />
            </View>
          </Channel>
        </Chat>
      </ChatOverlayProvider>
    </SafeAreaView>
  );
};

export default ChatRoom;
