import React, {useState, forwardRef, useImperativeHandle} from 'react';
import {View, Alert} from 'react-native';
import Dialog from 'react-native-dialog';

const PollDialog = forwardRef(({onSubmit}, ref) => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');

  useImperativeHandle(ref, () => ({
    show: () => {
      setStep(1);
      setQuestion('');
      setOptions('');
      setVisible(true);
    },
  }));

  const handleNext = () => {
    if (!question.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!options.trim()) {
      Alert.alert('Error', 'Please enter options');
      return;
    }

    const optionsArray = options
      .split(',')
      .map(o => o.trim())
      .filter(o => o);

    if (optionsArray.length < 2) {
      Alert.alert('Error', 'Please enter at least 2 options');
      return;
    }

    setVisible(false);
    onSubmit({question, options: optionsArray});
  };

  return (
    <View>
      {/* Question Dialog */}
      <Dialog.Container visible={visible && step === 1}>
        <Dialog.Title>Create Poll</Dialog.Title>
        <Dialog.Description>Enter your question:</Dialog.Description>
        <Dialog.Input
          placeholder="Poll question"
          value={question}
          onChangeText={setQuestion}
        />
        <Dialog.Button label="Cancel" onPress={() => setVisible(false)} />
        <Dialog.Button label="Next" onPress={handleNext} />
      </Dialog.Container>

      {/* Options Dialog */}
      <Dialog.Container visible={visible && step === 2}>
        <Dialog.Title>Poll Options</Dialog.Title>
        <Dialog.Description>
          Enter options (comma separated):
        </Dialog.Description>
        <Dialog.Input
          placeholder="Option 1, Option 2, Option 3"
          value={options}
          onChangeText={setOptions}
          multiline
        />
        <Dialog.Button label="Back" onPress={() => setStep(1)} />
        <Dialog.Button label="Send" onPress={handleSubmit} />
      </Dialog.Container>
    </View>
  );
});

export default PollDialog;