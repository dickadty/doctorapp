import {ref, update} from 'firebase/database';
import React, {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {ILNullPhoto, IconAddPhoto, IconRemovePhoto} from '../../assets';
import {Button, Gap, Header, Link} from '../../components';
import {db} from '../../config';
import {colors, fonts, showError, storeData} from '../../utils';

const UploadPhoto = ({navigation, route}) => {
  const {fullName = '', profession = '', uid = ''} = route.params;

  const [PhotoForDB, setPhotoForDB] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photo, setPhoto] = useState(ILNullPhoto);

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
          setHasPhoto(true);
        }
      },
    );
  };

  const uploadAndContinue = async () => {
    if (!uid) {
      showError('User ID tidak ditemukan.');
      return;
    }

    try {
      const userRef = ref(db, `doctors/${uid}`);
      await update(userRef, {photo: PhotoForDB});
      const data = {...route.params, photo: PhotoForDB};
      await storeData('user', data);
      navigation.navigate('MainApp');
    } catch (error) {
      showError(error.message);
    }
  };

  return (
    <View style={styles.page}>
      <Header title="Upload Photo" onPress={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.profile}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={getImage}>
            <Image source={photo} style={styles.avatar} />
            {hasPhoto && <IconRemovePhoto style={styles.addPhoto} />}
            {!hasPhoto && <IconAddPhoto style={styles.addPhoto} />}
          </TouchableOpacity>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.profession}>{profession}</Text>
        </View>
        <View>
          <Button
            title="Upload and Continue"
            disable={!hasPhoto}
            onPress={uploadAndContinue}
          />
          <Gap height={30} />
          <Link
            title="Skip for this"
            align="center"
            size={16}
            onPress={() => navigation.replace('MainApp')}
          />
        </View>
      </View>
    </View>
  );
};

export default UploadPhoto;

const styles = StyleSheet.create({
  page: {flex: 1, backgroundColor: colors.white},
  content: {
    paddingHorizontal: 40,
    paddingBottom: 64,
    flex: 1,
    justifyContent: 'space-between',
  },
  profile: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  avatar: {width: 110, height: 110, borderRadius: 110 / 2},
  avatarWrapper: {
    width: 130,
    height: 130,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 130 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {position: 'absolute', bottom: 8, right: 6},
  name: {
    fontSize: 24,
    color: colors.text.primary,
    fontFamily: fonts.primary[600],
    textAlign: 'center',
  },
  profession: {
    fontSize: 18,
    fontFamily: fonts.primary.normal,
    textAlign: 'center',
    color: colors.text.secondary,
    marginTop: 4,
  },
});
