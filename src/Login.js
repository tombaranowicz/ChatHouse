import * as React from 'react';
import {useState, useEffect} from 'react';
import {Text, Pressable, StyleSheet, View} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';

const LoginScreen = ({navigation}) => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [requestInProgress, setRequestInProgress] = useState(false);
  let timerId;

  const getCurrentUser = async () => {
    const currentUser = await GoogleSignin.getCurrentUser();
    console.log(`GET CURRENT USER ------- ${JSON.stringify(currentUser)}`);
    setUser(currentUser);
    setInitializing(false);
  };

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

  const navigateToChats = user => {
    console.log(`NAVIGATE WITH USER ${JSON.stringify(user)}`);
    setRequestInProgress(false);
    navigation.navigate('Chats', user);
  };

  useEffect(() => {
    GoogleSignin.configure();
    getCurrentUser();
  }, []);

  const fetchUserData = async () => {
    console.log(`FETCH USER DATA ${JSON.stringify(user.user)}`);
    clearTimeout(timerId);
    setRequestInProgress(true);
    const email = user.user.email; //'tbaranowicz@gmail.com';
    console.log(`FETCH FOR EMAIL ${email}`);
    const userRef = firestore().collection('Users').doc(email);
    const doc = await userRef.get();
    if (!doc.exists) {
      //ADD
      const userName = user.user.name; //'Tomek';
      await userRef.set(
        {
          userName,
          email,
          userId: makeid(9),
        },
        {merge: true},
      );
      timerId = setTimeout(() => {
        fetchUserData();
        setRequestInProgress(false);
      }, 2000);
    } else {
      if (doc._data.token != null) {
        navigateToChats(doc._data);
      } else {
        timerId = setTimeout(() => {
          fetchUserData();
          setRequestInProgress(false);
        }, 2000);
      }
    }
  };

  useEffect(() => {
    if (user != null && !requestInProgress) {
      fetchUserData();
    }
  }, [user]);

  const loginHandler = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // setRequestInProgress(false);
      setUser(userInfo);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
    // navigateToChats();
  };

  return initializing ? (
    <Text>Initializing...</Text>
  ) : (
    <View style={styles.centeredView}>
      <Pressable
        style={[styles.button, styles.buttonLogIn]}
        onPress={loginHandler}>
        <Text style={styles.textStyle}>Sign In with Google</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderRadius: 4,
    padding: 10,
    elevation: 2,
  },
  buttonLogIn: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LoginScreen;
