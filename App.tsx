import React, {useEffect, useRef, useState} from 'react';
import {View, Text, Image} from 'react-native';
import * as tf from '@tensorflow/tfjs';
import {fetch, decodeJpeg} from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocossd from '@tensorflow-models/coco-ssd';
import * as jpeg from 'jpeg-js'

import Camera from './Camera';
import ImagePickerExample from './ImagePicker';
import * as FileSystem from 'expo-file-system';


const App = () => {
  const [isTfReady, setIsTfReady] = useState(false);
  const [result, setResult] = useState('');
  // const image = useRef(null);
  const [imageFromPicker, setImageFromPicker] = useState({uri:''});
  const image = useRef(null);
  const load1 = async () => {
    try {
      setIsTfReady(false);
      await tf.ready();
      const model = await mobilenet.load();
      
      setIsTfReady(true);
      // Start inference and show result
      if(!imageFromPicker?.uri){
        return ;
      }
      
      const imageAssetPath = Image.resolveAssetSource((imageFromPicker));
      // const response = await fetch(imageAssetPath?.uri, {}, { isBinary: true });
      // console.log(response);
      // const imageDataArrayBuffer = await imageFromPicker.arrayBuffer();
      // const imageData = new Uint8Array(imageDataArrayBuffer);

      const imgB64 = await FileSystem.readAsStringAsync(imageAssetPath.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      const raw = new Uint8Array(imgBuffer)
      const imageTensor = decodeJpeg(raw);

      const prediction = await model.classify(imageTensor);
      setResult('');
      if (prediction && prediction.length > 0) {
        setResult(
          `${prediction[0].className} (${prediction[0].probability.toFixed(3)})`
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
//
const classifyUsingCocoSSD = async () => {
  try {
    // Load Coco-SSD.
    await tf.ready();
    const model = await cocossd.load();
    setIsTfReady(true);
    console.log("starting inference with picked image: " + imageFromPicker)
    const imageAssetPath = Image.resolveAssetSource((imageFromPicker));

   // Convert image to tensor
    const imgB64 = await FileSystem.readAsStringAsync(imageAssetPath.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
   const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
   const raw = new Uint8Array(imgBuffer)
   const TO_UINT8ARRAY = true
   const { width, height, data } = jpeg.decode(raw, TO_UINT8ARRAY)
   const buffer = new Uint8Array(width * height * 3)
    let offset = 0
   for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset]
      buffer[i + 1] = data[offset + 1]
      buffer[i + 2] = data[offset + 2]
      offset += 4
    }
    const imageTensor = tf.tensor3d(buffer, [height, width, 3])
    // Classify the tensor and show the result
    const prediction = await model.detect(imageTensor);
    console.log(prediction)
   if (prediction && prediction.length > 0) {
     setResult(`${prediction[0].class} (${prediction[0].score.toFixed(3)})`);
    }
  } catch (err) {
    console.log(err);
  }
}
//
  const load = async () => {
    try {
      // Load mobilenet.
      await tf.ready();
      const model = await mobilenet.load();
      setIsTfReady(true);

      // Start inference and show result.
      const image = require('./guitarra.jpg');
      const imageAssetPath = Image.resolveAssetSource(image);
      const response = await fetch(imageAssetPath.uri, {}, { isBinary: true });
      const imageDataArrayBuffer = await response.arrayBuffer();
      const imageData = new Uint8Array(imageDataArrayBuffer);
      const imageTensor = decodeJpeg(imageData);
      const prediction = await model.classify(imageTensor);
      if (prediction && prediction.length > 0) {
        setResult(
          `${prediction[0].className} (${prediction[0].probability.toFixed(3)})`
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if(imageFromPicker?.uri != '' && isTfReady == true){
      classifyUsingCocoSSD()
    };
  }, [imageFromPicker]);

  useEffect(() => {
    
      load()
    
  }, []);
  
  return (
    <View
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ImagePickerExample setImage={setImageFromPicker}/>
      {!isTfReady ? <Text>Loading TFJS model...</Text>: <Text>TFJS model is loaded...</Text>}
      {isTfReady && result === '' && <Text>Classifying...</Text>}
      {result !== '' && <Text>{result}</Text>}
    </View>
  );
};

export default App;
