import {signInWithEmailAndPassword} from 'firebase/auth';
import {get, ref} from 'firebase/database';
import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {ILLogo} from '../../assets';
import {Button, Gap, Input, Link} from '../../components';
import {auth, db} from '../../config';
import {colors, fonts, showError, storeData, useForm} from '../../utils';
import {useDispatch} from 'react-redux';

const Login = ({navigation}) => {
  const [form, setForm] = useForm({email: '', password: ''});
  const dispatch = useDispatch();

  const onContinue = () => {
    dispatch({type: 'SET_LOADING', value: true});
    signInWithEmailAndPassword(auth, form.email, form.password)
      .then(async userCredential => {
        const userRef = ref(db, `doctors/${userCredential.user.uid}`);
        get(userRef).then(resDB => {
          if (resDB.val()) {
            storeData('user', resDB.val());
            dispatch({type: 'SET_LOADING', value: false});
            navigation.replace('MainApp');
          }
        });
        // ...
      })
      .catch(error => {
        dispatch({type: 'SET_LOADING', value: false});
        showError(error.message);
      });
  };

  return (
    <View style={styles.page}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Gap height={40} />
        <ILLogo />
        <Text style={styles.title}>Masuk dan mulai berkonsultasi</Text>
        <Input
          label="Email Address"
          value={form.email}
          onChangeText={value => setForm('email', value)}
        />
        <Gap height={24} />
        <Input
          label="Password"
          value={form.password}
          onChangeText={value => setForm('password', value)}
          secureTextEntry
        />
        <Gap height={10} />
        <Link title="Forgot My Password" size={12} />
        <Gap height={40} />
        <Button title="Sign In" onPress={onContinue} />
        <Gap height={30} />
        <Link
          title="Create New Account"
          size={16}
          align="center"
          onPress={() => navigation.navigate('Register')}
        />
      </ScrollView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  page: {paddingHorizontal: 40, backgroundColor: colors.white, flex: 1},
  title: {
    fontSize: 20,
    fontFamily: fonts.primary[600],
    color: colors.text.primary,
    marginTop: 40,
    marginBottom: 40,
    maxWidth: 153,
  },
});
