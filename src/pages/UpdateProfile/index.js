import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {ILNullPhoto} from '../../assets';
import {Button, Gap, Header, Input, Profile} from '../../components';
import {colors, getData, storeData, showError} from '../../utils';
import {getAuth, updatePassword} from 'firebase/auth';
import {launchImageLibrary} from 'react-native-image-picker';
import {getDatabase, ref, update} from 'firebase/database';

const UpdateProfile = ({navigation}) => {
  const [profile, setProfile] = useState({
    fullName: '',
    profession: '',
    email: '',
    uid: '',
  });

  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState(ILNullPhoto);
  const [photoForDB, setPhotoForDB] = useState('');

  useEffect(() => {
    getData('user').then(res => {
      if (res) {
        setProfile({
          ...res,
          photoForDB: res.photo || ILNullPhoto,
        });
        setPhoto(res.photo ? {uri: res.photo} : ILNullPhoto);
      }
    });
  }, []);

  const getImage = () => {
    launchImageLibrary(
      {quality: 0.5, maxWidth: 200, maxHeight: 200, includeBase64: true},
      response => {
        if (response.didCancel || response.errorMessage) {
          showError('Oops, sepertinya Anda tidak memilih foto.');
        } else if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0];
          setPhoto({uri: selectedImage.uri});
          setPhotoForDB(
            `data:${selectedImage.type};base64,${selectedImage.base64}`,
          );
        }
      },
    );
  };

  const updateProfile = async () => {
    if (!profile.uid) {
      showError('User ID tidak ditemukan!');
      return;
    }

    const updatedData = {
      fullName: profile.fullName,
      profession: profile.profession,
      email: profile.email,
      photo: photoForDB || profile.photo,
    };

    try {
      const userRef = ref(getDatabase(), `doctors/${profile.uid}/`);
      await update(userRef, updatedData);

      storeData('user', {...profile, photo: updatedData.photo});
      navigation.replace('MainApp');
    } catch (error) {
      showError(error.message);
    }
  };

  const changeText = (key, value) => {
    setProfile(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };

  const updateUserPassword = async () => {
    if (password.length < 6) {
      showError('Password harus lebih dari 6 karakter!');
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, password);
        showError('Password berhasil diperbarui!');
      } else {
        showError('User tidak ditemukan!');
      }
    } catch (error) {
      showError(error.message);
    }
  };

  const handleUpdate = async () => {
    if (password.length > 0) {
      await updateUserPassword();
    }
    await updateProfile();
  };

  return (
    <View style={styles.page}>
      <Header title="Edit Profile" onPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Profile isRemove photo={photo} onPress={getImage} />
          <Gap height={26} />
          <Input
            label="Full Name"
            value={profile.fullName}
            onChangeText={value => changeText('fullName', value)}
          />
          <Gap height={24} />
          <Input
            label="Pekerjaan"
            value={profile.profession}
            onChangeText={value => changeText('profession', value)}
          />
          <Gap height={24} />
          <Input label="Email" value={profile.email} disable />
          <Gap height={24} />
          <Input
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={value => setPassword(value)}
          />
          <Gap height={40} />
          <Button title="Save Profile" onPress={handleUpdate} />
        </View>
      </ScrollView>
    </View>
  );
};

export default UpdateProfile;

const styles = StyleSheet.create({
  page: {backgroundColor: colors.white, flex: 1},
  content: {padding: 40, paddingTop: 0},
});
