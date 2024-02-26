import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export default function ImagePickerExample(props) {
  const [image, setImage] = useState(null);
  const [status, requestPermission] = ImagePicker.useCameraPermissions();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    // if (!result.canceled) {
        
    //   setImage(result);
    //   props.setImage(result)  
    // }

    if (!result.cancelled) {
		// dummy fixing ImagePicker bug in EXPO SDK46
		//TODO remove this bugfix with next EXPO SDK release
		const dummyManipulationResult = await ImageManipulator.manipulateAsync(
			result.uri,
			[],
			{}
		);
		//end of dummy fix...

		// setPickedImage(result.uri);
		// props.onImageTaken(result.uri);

		setImage(dummyManipulationResult);
		props.setImage(dummyManipulationResult);
	}
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image.uri }} style={{ width: 200, height: 200 }} />}
    </View>
  );
}
